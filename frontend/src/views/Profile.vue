<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { collection, getDocs, query, where, doc, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth, login, logout } from '../composables/useAuth'
import InvitationPanel from '../components/InvitationPanel.vue'


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

const myEvents = ref<Event[]>([])
const rsvpAttendees = ref<Attendee[]>([])
const rsvpEvents = ref<Event[]>([])
const loading = ref(true)

// Delete dialog
const deleteDialog = ref(false)
const eventToDelete = ref<Event | null>(null)
const deleting = ref(false)

// Edit dialog
const editDialog = ref(false)
const editingEvent = ref<Event | null>(null)
const editTitle = ref('')
const editDescription = ref('')
const editDate = ref('')
const editTime = ref('')
const editLocation = ref('')
const editImageUrl = ref('')
const editIsPublic = ref(false)
const editUrgency = ref(1)
const saving = ref(false)
const editError = ref('')

// Snackbar
const snackbar = ref(false)
const snackbarMessage = ref('')

async function loadProfile() {
  if (!user.value) return
  loading.value = true
  try {
    // Load events created by this user
    const myEventsSnap = await getDocs(query(collection(db, 'events'), where('creator_id', '==', user.value.uid)))
    myEvents.value = myEventsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Event)).sort((a, b) => a.event_date.localeCompare(b.event_date))

    // Load this user's RSVPs
    const rsvpSnap = await getDocs(query(collection(db, 'attendees'), where('user_id', '==', user.value.uid)))
    rsvpAttendees.value = rsvpSnap.docs.map(d => ({ id: d.id, ...d.data() } as Attendee))

    // Load the event details for each RSVP, excluding events they created
    const myEventIds = new Set(myEvents.value.map(e => e.id))
    const rsvpEventIds = rsvpAttendees.value
      .map(a => a.event_id)
      .filter(id => !myEventIds.has(id))

    if (rsvpEventIds.length > 0) {
      const allEventsSnap = await getDocs(collection(db, 'events'))
      rsvpEvents.value = allEventsSnap.docs
        .filter(d => rsvpEventIds.includes(d.id))
        .map(d => ({ id: d.id, ...d.data() } as Event))
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

function getRsvpStatus(eventId: string) {
  return rsvpAttendees.value.find(a => a.event_id === eventId)?.rsvp_status || ''
}

function confirmDelete(event: Event) {
  eventToDelete.value = event
  deleteDialog.value = true
}

async function deleteEvent() {
  if (!eventToDelete.value) return
  deleting.value = true
  try {
    // Delete all attendee records for this event first
    const attendeeSnap = await getDocs(query(collection(db, 'attendees'), where('event_id', '==', eventToDelete.value.id)))
    const deletePromises = attendeeSnap.docs.map(d => deleteDoc(doc(db, 'attendees', d.id)))
    await Promise.all(deletePromises)

    // Then delete the event itself
    await deleteDoc(doc(db, 'events', eventToDelete.value.id))
    myEvents.value = myEvents.value.filter(e => e.id !== eventToDelete.value!.id)
    snackbarMessage.value = 'Event deleted.'
    snackbar.value = true
    deleteDialog.value = false
  } catch (err) {
    console.error(err)
  } finally {
    deleting.value = false
    eventToDelete.value = null
  }
}

function openEdit(event: Event) {
  editingEvent.value = event
  editTitle.value = event.title
  editDescription.value = event.description
  editDate.value = event.event_date
  editTime.value = event.event_time
  editLocation.value = event.location
  editImageUrl.value = event.image_url
  editIsPublic.value = event.is_public
  editUrgency.value = event.priority
  editError.value = ''
  editDialog.value = true
}

async function saveEdit() {
  if (!editingEvent.value || !editTitle.value || !editDate.value) {
    editError.value = 'Title and date are required.'
    return
  }
  saving.value = true
  editError.value = ''
  try {
    const updates = {
      title: editTitle.value,
      description: editDescription.value,
      event_date: editDate.value,
      event_time: editTime.value,
      location: editLocation.value,
      image_url: editImageUrl.value,
      is_public: editIsPublic.value,
      priority: editUrgency.value,
    }
    await updateDoc(doc(db, 'events', editingEvent.value.id), updates)

    // Update local list so UI reflects changes immediately
    const idx = myEvents.value.findIndex(e => e.id === editingEvent.value!.id)
    if (idx !== -1) myEvents.value[idx] = { ...myEvents.value[idx], ...updates } as Event

    snackbarMessage.value = 'Event updated.'
    snackbar.value = true
    editDialog.value = false
  } catch (err) {
    editError.value = 'Something went wrong. Please try again.'
    console.error(err)
  } finally {
    saving.value = false
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  const d = new Date(Number(year), Number(month) - 1, Number(day))
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function priorityColor(level: number) {
  if (level <= 2) return 'success'
  if (level === 3) return 'warning'
  return 'error'
}

function priorityLabel(level: number) {
  if (level <= 2) return 'Low'
  if (level === 3) return 'Medium'
  return 'High'
}

onMounted(loadProfile)
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
          <RouterLink to="/"><img class="tablet-desktop" src="../images/occurency_logo.png" alt="Occurency Logo"></RouterLink>
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

          <!-- User Info Card -->
          <v-card class="mb-6 pa-4" elevation="2" rounded="lg" color="#E5F4E3">
            <div class="card-accent-bar mb-4"></div>
            <div class="d-flex align-center gap-4">
              <v-avatar size="72" color="primary">
                <v-img v-if="user.photoURL" :src="user.photoURL" />
                <span v-else class="text-h5 text-white">{{ (user.displayName ?? user.email ?? '?').charAt(0).toUpperCase() }}</span>
              </v-avatar>
              <div>
                <div class="text-h6 font-weight-bold">{{ user.displayName || 'No name set' }}</div>
                <div class="text-body-2 text-black">{{ user.email }}</div>
              </div>
            </div>
          </v-card>

          <!-- Loading -->
          <div v-if="loading" class="text-center py-10">
            <v-progress-circular indeterminate color="primary" size="48" />
          </div>

          <div v-else>
            <!-- My Events -->
            <h2 class="section-title oswald-regular">My Events</h2>
            <div v-if="myEvents.length === 0" class="text-grey mb-6">
              You haven't created any events yet. <RouterLink to="/new-event">Create one!</RouterLink>
            </div>
            <v-row class="mb-8">
              <v-col v-for="event in myEvents" :key="event.id" cols="12" sm="6" lg="4">
                <v-card rounded="lg" elevation="3" color="#E5F4E3" class="d-flex flex-column" height="100%">
                  <div class="card-accent-bar"></div>
                  <v-card-title class="text-wrap pt-3 font-weight-bold" style="color: #2c2c2c;">{{ event.title }}</v-card-title>
                  <v-card-subtitle style="color: #444; opacity: 1;">
                    <div><v-icon size="small">mdi-calendar</v-icon> {{ formatDate(event.event_date) }}</div>
                    <div v-if="event.location"><v-icon size="small">mdi-map-marker</v-icon> {{ event.location }}</div>
                  </v-card-subtitle>
                  <v-card-text class="flex-grow-1" style="color: #555;">
                    <v-chip :color="priorityColor(event.priority)" size="small" label class="mb-2">
                      {{ priorityLabel(event.priority) }} Priority
                    </v-chip>
                    <v-chip :color="event.is_public ? 'primary' : 'grey'" size="small" label class="mb-2 ml-1">
                      {{ event.is_public ? 'Public' : 'Private' }}
                    </v-chip>
                    <p class="text-body-2 mt-2">{{ event.description }}</p>
					<InvitationPanel
  				      :eventId="event.id"
  					  :eventTitle="event.title"
				    />
                  </v-card-text>
                  <v-card-actions class="pa-3">
                    <v-btn variant="tonal" color="primary" size="small" @click="openEdit(event)" prepend-icon="mdi-pencil">
                      Edit
                    </v-btn>
                    <v-btn variant="tonal" color="error" size="small" @click="confirmDelete(event)" prepend-icon="mdi-delete">
                      Delete
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>

            <!-- Events I'm Attending -->
            <h2 class="section-title oswald-regular">Other Events I'm Attending</h2>
            <div v-if="rsvpEvents.length === 0" class="text-grey mb-6">
              You haven't RSVP'd to any events yet. <RouterLink to="/explore">Explore events!</RouterLink>
            </div>
            <v-row>
              <v-col v-for="event in rsvpEvents" :key="event.id" cols="12" sm="6" lg="4">
                <v-card rounded="lg" elevation="3" color="#E5F4E3" class="d-flex flex-column" height="100%">
                  <div class="card-accent-bar"></div>
                  <v-card-title class="text-wrap pt-3 font-weight-bold" style="color: #2c2c2c;">{{ event.title }}</v-card-title>
                  <v-card-subtitle style="color: #444; opacity: 1;">
                    <div><v-icon size="small">mdi-calendar</v-icon> {{ formatDate(event.event_date) }}</div>
                    <div v-if="event.location"><v-icon size="small">mdi-map-marker</v-icon> {{ event.location }}</div>
                  </v-card-subtitle>
                  <v-card-text class="flex-grow-1" style="color: #555;">
                    <v-chip
                      :color="getRsvpStatus(event.id) === 'Going' ? 'success' : getRsvpStatus(event.id) === 'Maybe' ? 'warning' : 'error'"
                      size="small" label class="mb-2"
                    >
                      {{ getRsvpStatus(event.id) }}
                    </v-chip>
                    <p class="text-body-2 mt-2">{{ event.description }}</p>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>

        </v-container>
      </div>
    </main>

    <!-- Delete Confirm Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card rounded="lg">
        <div class="card-accent-bar"></div>
        <v-card-title class="pt-4 px-6">Delete Event</v-card-title>
        <v-card-text class="px-6">
          Are you sure you want to delete <strong>{{ eventToDelete?.title }}</strong>? This cannot be undone.
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="deleteEvent">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Event Dialog -->
    <v-dialog v-model="editDialog" max-width="650" scrollable>
      <v-card rounded="lg">
        <div class="card-accent-bar"></div>
        <v-card-title class="pt-4 px-6">Edit Event</v-card-title>
        <v-card-text class="px-6">
          <v-alert v-if="editError" type="error" variant="tonal" class="mb-4">{{ editError }}</v-alert>
          <v-form @submit.prevent="saveEdit">
            <v-row>
              <v-col cols="12">
                <v-text-field v-model="editTitle" label="Event Title" required variant="outlined" color="primary" />
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="editDescription" label="Description" rows="3" variant="outlined" color="primary" auto-grow />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="editDate" label="Date" type="date" required variant="outlined" color="primary" />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="editTime" label="Time" type="time" variant="outlined" color="primary" />
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="editLocation" label="Location" variant="outlined" color="primary" />
              </v-col>
              <v-col cols="12">
                <div class="urgency-label mb-1">
                  <v-icon color="primary" size="small">mdi-alert-circle-outline</v-icon>
                  <span>Priority: <strong>{{ editUrgency }}</strong> / 5</span>
                </div>
                <v-slider v-model="editUrgency" :min="1" :max="5" :step="1" color="primary" track-color="secondary" show-ticks="always" tick-size="4">
                  <template v-slot:prepend><span class="text-caption">Low</span></template>
                  <template v-slot:append><span class="text-caption">High</span></template>
                </v-slider>
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="editImageUrl" label="Event Image URL (optional)" variant="outlined" color="primary" />
              </v-col>
              <v-col cols="12">
                <v-switch v-model="editIsPublic" color="primary" :label="editIsPublic ? 'Public' : 'Private'" inset />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="editDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="saving" @click="saveEdit">Save Changes</v-btn>
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
      <p><a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="703f13130502151e1309391e1330171d11191c5e131f1d">[email&#160;protected]</a></p>
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
.section-title {
  color: #6D326D;
  font-size: 1.6em;
  margin-bottom: 0.75em;
}

.card-accent-bar {
  height: 6px;
  background: linear-gradient(to right, #6D326D, #83a85e);
  width: 100%;
}

.urgency-label {
  display: flex;
  align-items: center;
  gap: 0.4em;
  font-size: 0.95em;
  color: #4a4a4a;
}

.gap-4 {
  gap: 1rem;
}
</style>