<script setup lang="ts">
import { useAuth, login, logout } from '../composables/useAuth'
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs, query, where, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'
import CommentsSection from '../components/CommentsSection.vue'

const { user } = useAuth()

interface Event {
  id: string
  title: string
  description: string
  event_date: string
  event_time: string
  location: string
  priority: number
  is_public: boolean
  creator_id: string
  creator_email: string
  creator_name: string
  image_url: string
  created_at: any
}

interface Attendee {
  id: string
  event_id: string
  user_id: string
  user_email: string
  user_name: string
  rsvp_status: 'Going' | 'Maybe' | 'Not Going'
}

const events = ref<Event[]>([])
const attendees = ref<Attendee[]>([])
const allAttendees = ref<Attendee[]>([])
const loading = ref(true)
const loadingAttendees = ref(false)

// Search/filter
const searchKeyword = ref('')
const dateFrom = ref('')
const dateTo = ref('')

// Dialogs
const detailDialog = ref(false)
const attendeesDialog = ref(false)
const selectedEvent = ref<Event | null>(null)

// Snackbar
const snackbar = ref(false)
const snackbarMessage = ref('')

const placeholderImage = '/src/images/calendar.jpg'

function getImage(event: Event) {
  return event.image_url && event.image_url.trim() !== '' ? event.image_url : placeholderImage
}

async function loadEvents() {
  loading.value = true
  try {
    const q = query(collection(db, 'events'), where('is_public', '==', true))
    const snapshot = await getDocs(q)
    events.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Event))

    if (user.value) {
      const aSnap = await getDocs(query(collection(db, 'attendees'), where('user_id', '==', user.value.uid)))
      attendees.value = aSnap.docs.map(d => ({ id: d.id, ...d.data() } as Attendee))
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

// Filtered events based on search
const filteredEvents = computed(() => {
  return events.value.filter(event => {
    const matchesKeyword = searchKeyword.value === '' ||
      event.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchKeyword.value.toLowerCase())

    const matchesFrom = dateFrom.value === '' || event.event_date >= dateFrom.value
    const matchesTo = dateTo.value === '' || event.event_date <= dateTo.value

    return matchesKeyword && matchesFrom && matchesTo
  })
})

function clearFilters() {
  searchKeyword.value = ''
  dateFrom.value = ''
  dateTo.value = ''
}

function getUserRsvp(eventId: string) {
  return attendees.value.find(a => a.event_id === eventId)
}

async function rsvp(event: Event, status: 'Going' | 'Maybe' | 'Not Going') {
  if (!user.value) return
  const existing = getUserRsvp(event.id)

  try {
    if (existing) {
      if (existing.rsvp_status === status) {
        await deleteDoc(doc(db, 'attendees', existing.id))
        attendees.value = attendees.value.filter(a => a.id !== existing.id)
        // Also remove from allAttendees if loaded
        allAttendees.value = allAttendees.value.filter(a => a.id !== existing.id)
        snackbarMessage.value = 'RSVP removed.'
      } else {
        await updateDoc(doc(db, 'attendees', existing.id), { rsvp_status: status })
        existing.rsvp_status = status
        const allExisting = allAttendees.value.find(a => a.id === existing.id)
        if (allExisting) allExisting.rsvp_status = status
        snackbarMessage.value = `RSVP updated: ${status}`
      }
    } else {
      const docRef = await addDoc(collection(db, 'attendees'), {
        event_id: event.id,
        user_id: user.value.uid,
        user_email: user.value.email,
        user_name: user.value?.displayName || user.value?.email,
        rsvp_status: status,
        created_at: Timestamp.now(),
      })
      const newAttendee = { id: docRef.id, event_id: event.id, user_id: user.value.uid, user_email: user.value.email || '', user_name: user.value?.displayName || user.value?.email || '', rsvp_status: status }
      attendees.value.push(newAttendee)
      allAttendees.value.push(newAttendee)
      snackbarMessage.value = `RSVP set: ${status}`
    }
    snackbar.value = true
  } catch (err) {
    console.error(err)
  }
}

async function openDetail(event: Event) {
  selectedEvent.value = event
  detailDialog.value = true
  // Load all attendees for this event
  loadingAttendees.value = true
  try {
    const aSnap = await getDocs(query(collection(db, 'attendees'), where('event_id', '==', event.id)))
    allAttendees.value = aSnap.docs.map(d => ({ id: d.id, ...d.data() } as Attendee))
  } catch (err) {
    console.error(err)
  } finally {
    loadingAttendees.value = false
  }
}

function openAttendees() {
  attendeesDialog.value = true
}

function attendeesByStatus(status: string) {
  return allAttendees.value.filter(a => a.rsvp_status === status)
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  const d = new Date(Number(year), Number(month) - 1, Number(day))
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function formatTime(timeStr: string) {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':')
  const d = new Date()
  d.setHours(Number(h), Number(m))
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function priorityColor(level: number) {
  if (level <= 2) return 'success'
  if (level === 3) return 'warning'
  return 'error'
}

function priorityLabel(level: number) {
  if (level <= 2) return 'Low Priority'
  if (level === 3) return 'Medium Priority'
  return 'High Priority'
}

onMounted(loadEvents)
</script>

<template>
  <div id="container">
    <!-- Mobile Nav -->
    <nav class="mobile-nav">
      <div id="menu-links">
        <li class="nav-button"><RouterLink to="/">Home</RouterLink></li>
        <li class="nav-button"><RouterLink to="/explore">Explore Events</RouterLink></li>
        <li class="nav-button"><RouterLink to="/about">About Us</RouterLink></li>
        <li class="nav-button"><RouterLink to="/contact">Contact Us</RouterLink></li>
        <li class="nav-button"><RouterLink to="/new-event">New Event</RouterLink></li>
        <li class="nav-button"><RouterLink to="/profile">Profile</RouterLink></li>
      </div>
      <a class="menu-icon" onclick="hamburger()">
        <div>&#9776;</div>
      </a>
    </nav>

    <header>
      <div class="header-left">
        <figure>
          <RouterLink to="/"><img class="tablet-desktop" src="/src/images/occurency_temp_logo.png" alt="Occurency Logo"></RouterLink>
          <h2 class="slogan oswald-regular">Your greatest memories start here</h2>
        </figure>
        <div v-if="user" class="login-container">
          <p class="login-text">Welcome, {{ user.displayName || user.email }}</p>
          <button class="login-button" @click="logout">Logout</button>
        </div>
        <div v-else class="login-container">
          <p class="login-text">You are not logged in.</p>
          <button class="login-button" @click="login">Login with Google</button>
        </div>
      </div>
      <nav>
        <ul class="oswald-regular tablet-desktop">
          <li class="nav-button"><RouterLink to="/">Home</RouterLink></li>
          <li class="nav-button"><RouterLink to="/explore">Explore Events</RouterLink></li>
          <li class="nav-button"><RouterLink to="/about">About Us</RouterLink></li>
          <li class="nav-button"><RouterLink to="/contact">Contact Us</RouterLink></li>
          <li class="nav-button"><RouterLink to="/new-event">New Event</RouterLink></li>
          <li class="nav-button"><RouterLink to="/profile">Profile</RouterLink></li>
        </ul>
      </nav>
    </header>

    <main>
      <div v-if="!user">
        <h2>You must be logged in to see this page.</h2>
        <button class="login-button" @click="login">Login with Google</button>
      </div>
      <div v-else>
        <v-container>
          <h2 class="page-title oswald-regular">Explore Events</h2>

          <!-- Search & Filter Bar -->
          <v-card class="mb-6 pa-4 search-card" elevation="2" rounded="lg" color="#E5F4E3">
            <v-row align="center">
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="searchKeyword"
                  label="Search events..."
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  color="primary"
                  density="compact"
                  hide-details
                  bg-color="white"
                  clearable
                />
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-text-field
                  v-model="dateFrom"
                  label="From date"
                  type="date"
                  variant="outlined"
                  color="primary"
                  density="compact"
                  hide-details
                  bg-color="white"
                  prepend-inner-icon="mdi-calendar-start"
                />
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-text-field
                  v-model="dateTo"
                  label="To date"
                  type="date"
                  variant="outlined"
                  color="primary"
                  density="compact"
                  hide-details
                  bg-color="white"
                  prepend-inner-icon="mdi-calendar-end"
                />
              </v-col>
              <v-col cols="12" md="2" class="text-center">
                <v-btn variant="outlined" color="primary" @click="clearFilters" block>
                  Clear
                </v-btn>
              </v-col>
            </v-row>
          </v-card>

          <!-- Result count -->
          <p v-if="!loading" class="result-count mb-4">
            Showing {{ filteredEvents.length }} event{{ filteredEvents.length !== 1 ? 's' : '' }}
          </p>

          <!-- Loading -->
          <div v-if="loading" class="text-center py-10">
            <v-progress-circular indeterminate color="primary" size="48" />
          </div>

          <!-- No events -->
          <div v-else-if="filteredEvents.length === 0" class="text-center py-10">
            <v-icon size="64" color="grey-lighten-1">mdi-calendar-remove</v-icon>
            <p class="text-grey mt-4">
              {{ events.length === 0 ? 'No public events yet.' : 'No events match your search.' }}
              <RouterLink v-if="events.length === 0" to="/new-event">Create one!</RouterLink>
            </p>
          </div>

          <!-- Events Grid -->
          <v-row v-else>
            <v-col v-for="event in filteredEvents" :key="event.id" cols="12" sm="6" lg="4">
              <v-card
                rounded="lg"
                elevation="3"
                height="100%"
                class="event-card d-flex flex-column"
                @click="openDetail(event)"
                color="#E5F4E3"
                style="cursor: pointer;"
              >
                <!-- Event Image -->
                <v-img
                  :src="getImage(event)"
                  height="180"
                  cover
                  class="event-img"
                >
                  <!-- Priority chip overlaid on image -->
                  <div class="image-chip-overlay">
                    <v-chip :color="priorityColor(event.priority)" size="small" label>
                      {{ priorityLabel(event.priority) }}
                    </v-chip>
                  </div>
                </v-img>

                <v-card-title class="text-wrap pt-3 font-weight-bold" style="color: #2c2c2c; font-size: 1.2em;">{{ event.title }}</v-card-title>

                <v-card-subtitle class="pb-2" style="color: #444; opacity: 1;">
                  <div><v-icon size="small">mdi-calendar</v-icon> {{ formatDate(event.event_date) }}<span v-if="event.event_time"> &bull; {{ formatTime(event.event_time) }}</span></div>
                  <div v-if="event.location"><v-icon size="small">mdi-map-marker</v-icon> {{ event.location }}</div>
                </v-card-subtitle>

                <v-divider class="mx-3 mb-2"></v-divider>
                <v-card-text class="text-body-2 pt-0 description-preview flex-grow-1" style="color: #555;">
                  {{ event.description }}
                </v-card-text>

                <v-card-actions class="pa-3 mt-auto">
                  <v-btn variant="tonal" color="primary" size="small" block>
                    View Details & RSVP
                  </v-btn>
                </v-card-actions>

              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </div>
    </main>

    <!-- Event Detail Dialog -->
    <v-dialog v-model="detailDialog" max-width="650" scrollable>
      <v-card v-if="selectedEvent" rounded="lg">
        <div class="card-accent-bar"></div>

        <!-- Event Image -->
        <v-img :src="getImage(selectedEvent)" height="220" contain class="event-img" />

        <v-card-title class="text-h5 pt-4 px-6">{{ selectedEvent.title }}</v-card-title>

        <v-card-text class="px-6">
          <!-- Date/Time/Location -->
          <div class="detail-meta mb-4">
            <div class="detail-row">
              <v-icon color="primary" size="small">mdi-calendar</v-icon>
              <span>{{ formatDate(selectedEvent.event_date) }}</span>
            </div>
            <div v-if="selectedEvent.event_time" class="detail-row">
              <v-icon color="primary" size="small">mdi-clock-outline</v-icon>
              <span>{{ formatTime(selectedEvent.event_time) }}</span>
            </div>
            <div v-if="selectedEvent.location" class="detail-row">
              <v-icon color="primary" size="small">mdi-map-marker</v-icon>
              <span>{{ selectedEvent.location }}</span>
            </div>
            <div class="detail-row">
              <v-icon color="primary" size="small">mdi-alert-circle-outline</v-icon>
              <v-chip :color="priorityColor(selectedEvent.priority)" size="small" label>
                {{ priorityLabel(selectedEvent.priority) }}
              </v-chip>
            </div>
            <div class="detail-row">
              <v-icon color="primary" size="small">mdi-account</v-icon>
              <span class="text-caption text-medium-emphasis">Created by {{ selectedEvent.creator_name || selectedEvent.creator_email }}</span>
            </div>
          </div>

          <!-- Description -->
          <p v-if="selectedEvent.description" class="text-body-1 mb-4">{{ selectedEvent.description }}</p>

          <v-divider class="mb-4" />

          <!-- RSVP -->
          <div class="text-subtitle-1 font-weight-bold mb-2">Your RSVP</div>
          <div class="d-flex gap-2 mb-4 flex-wrap">
            <v-btn
              v-for="status in ['Going', 'Maybe', 'Not Going']"
              :key="status"
              :variant="getUserRsvp(selectedEvent.id)?.rsvp_status === status ? 'flat' : 'outlined'"
              :color="status === 'Going' ? 'success' : status === 'Maybe' ? 'warning' : 'error'"
              @click="rsvp(selectedEvent, status as 'Going' | 'Maybe' | 'Not Going')"
            >
              {{ status }}
            </v-btn>
          </div>

          <!-- Attendees Button -->
          <v-btn
            variant="tonal"
            color="primary"
            prepend-icon="mdi-account-group"
            :loading="loadingAttendees"
            @click="openAttendees"
            block
          >
            Attendees ({{ allAttendees.length }})
          </v-btn>

          <v-divider class="my-4" />

          <CommentsSection :eventId="selectedEvent.id" />

        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="detailDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Attendees Dialog -->
    <v-dialog v-model="attendeesDialog" max-width="450" scrollable>
      <v-card rounded="lg">
        <v-card-title class="pa-4">
          <v-icon color="primary" class="mr-2">mdi-account-group</v-icon>
          Attendees
        </v-card-title>
        <v-card-text>
          <div v-if="allAttendees.length === 0" class="text-center py-6 text-grey">
            No RSVPs yet.
          </div>
          <div v-else>
            <!-- Going -->
            <div v-if="attendeesByStatus('Going').length > 0" class="mb-4">
              <div class="attendee-group-label text-success">
                <v-icon color="success" size="small">mdi-check-circle</v-icon>
                Going ({{ attendeesByStatus('Going').length }})
              </div>
              <v-list density="compact">
                <v-list-item v-for="a in attendeesByStatus('Going')" :key="a.id" :title="a.user_name || a.user_email" />
              </v-list>
            </div>
            <!-- Maybe -->
            <div v-if="attendeesByStatus('Maybe').length > 0" class="mb-4">
              <div class="attendee-group-label text-warning">
                <v-icon color="warning" size="small">mdi-help-circle</v-icon>
                Maybe ({{ attendeesByStatus('Maybe').length }})
              </div>
              <v-list density="compact">
                <v-list-item v-for="a in attendeesByStatus('Maybe')" :key="a.id" :title="a.user_name || a.user_email" />
              </v-list>
            </div>
            <!-- Not Going -->
            <div v-if="attendeesByStatus('Not Going').length > 0" class="mb-4">
              <div class="attendee-group-label text-error">
                <v-icon color="error" size="small">mdi-close-circle</v-icon>
                Not Going ({{ attendeesByStatus('Not Going').length }})
              </div>
              <v-list density="compact">
                <v-list-item v-for="a in attendeesByStatus('Not Going')" :key="a.id" :title="a.user_name || a.user_email" />
              </v-list>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="attendeesDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar" timeout="3000" color="primary">
      {{ snackbarMessage }}
    </v-snackbar>

    <footer class="oswald-regular">
      <p>&#169; Copyright 2026. All Rights Reserved.</p>
      <p>(622) 873-6297</p>
      <p>OccurencyInc@gmail.com</p>
      <p>Instagram, Twitter, Facebook, TikTok</p>
      <p>
        <RouterLink to="/">Home</RouterLink> &nbsp; &#9475; &nbsp;
        <RouterLink to="/explore">Explore Events</RouterLink> &nbsp; &#9475; &nbsp;
        <RouterLink to="/about">About Us</RouterLink> &nbsp; &#9475; &nbsp;
        <RouterLink to="/contact">Contact Us</RouterLink> &nbsp; &#9475; &nbsp;
        <RouterLink to="/new-event">New Event</RouterLink> &nbsp; &#9475; &nbsp;
        <RouterLink to="/profile">Profile</RouterLink>
      </p>
    </footer>
  </div>
</template>

<style scoped>
.page-title {
  color: #6D326D;
  font-size: 2em;
  margin-bottom: 0.75em;
  text-align: center;
}

.search-card {
  border: 1px solid #d0e8cc;
}

.result-count {
  color: #888;
  font-size: 0.9em;
}

.event-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.event-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important;
}

.image-chip-overlay {
  position: absolute;
  top: 10px;
  left: 10px;
}

.description-preview {
  display: -webkit-box;
  -webkit-line-clamp: 2;
   line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-accent-bar {
  height: 6px;
  background: linear-gradient(to right, #6D326D, #83a85e);
  width: 100%;
}

.detail-meta {
  display: flex;
  flex-direction: column;
  gap: 0.6em;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.5em;
  font-size: 0.95em;
}

.attendee-group-label {
  display: flex;
  align-items: center;
  gap: 0.4em;
  font-weight: 600;
  font-size: 0.95em;
  margin-bottom: 0.25em;
}

.gap-2 {
  gap: 0.5em;
}
</style>