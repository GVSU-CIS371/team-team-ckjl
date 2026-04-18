<script setup lang="ts">
import { useAuth, login, logout } from '../composables/useAuth'
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs, query, where, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'

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

function getUserRsvp(eventId: string) {
  return attendees.value.find(a => a.event_id === eventId)
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

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  const d = new Date(Number(year), Number(month) - 1, Number(day))
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

const popularEvents = computed(() => {
  return [...events.value]
    .sort((a, b) => (b.priority || 0) - (a.priority || 0))
    .slice(0, 4)
})

const randomEvents = computed(() => {
  return [...events.value]
    .sort(() => 0.5 - Math.random())
    .slice(0, 4)
})

onMounted(loadEvents)
</script>

<template>
	<div id="container">
		<!--Mobile Nav -->
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
					<RouterLink to="/" ><img class="tablet-desktop" src="../images/occurency_temp_logo.png" alt="Occurency Logo"></RouterLink>
					<h2 class="slogan oswald-regular">Your greatest memories start here</h2>
				</figure>

				<div v-if="user" class="login-container">
					<p class="login-text">Welcome, {{ user.email }}</p>
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

		<main class="oswald-regular">
			<div v-if="!user">
				<h2>You must be logged in to see this page.</h2>
				<button class="login-button" @click="login">Login with Google</button>
			</div>

			<div v-else>
				<h3 class="page-title">Your next adventure awaits!</h3>
				<p>Here at Occurency, we connect people with incredible experiences.</p>
				<p>Discover new friends, create unforgettable memories, and join a community that shares your passions!</p>

				<v-container>
				<div>
					<h4>Most Popular Events</h4>
					<v-row v-if="popularEvents.length > 0">
					<v-col v-for="event in popularEvents" :key="'pop-' + event.id" cols="12" sm="6" md="3">
						<v-card @click="openDetail(event)" color="#E5F4E3" hover class="rounded-lg">
						<v-img :src="getImage(event)" height="150" cover />
						<v-card-title>{{ event.title }}</v-card-title>
						<v-card-subtitle>{{ formatDate(event.event_date) }}</v-card-subtitle>
						</v-card>
					</v-col>
					</v-row>
				</div>

				<div>
					<h4>Events Near You</h4>
					<v-row v-if="randomEvents.length > 0">
					<v-col v-for="event in randomEvents" :key="'rnd-' + event.id" cols="12" sm="6" md="3">
						<v-card @click="openDetail(event)" color="#E5F4E3" hover class="rounded-lg">
						<v-img :src="getImage(event)" height="150" cover />
						<v-card-title>{{ event.title }}</v-card-title>
						<v-card-subtitle>{{ formatDate(event.event_date) }}</v-card-subtitle>
						</v-card>
					</v-col>
					</v-row>
				</div>

				<h4>
					Still haven't found the perfect event? 
					<RouterLink to="/explore">Explore more here!</RouterLink>
				</h4>
				</v-container>
			</div>
		</main>

			<v-dialog v-model="detailDialog" max-width="650" scrollable>
			</v-dialog>

			<v-dialog v-model="attendeesDialog" max-width="450" scrollable>
			</v-dialog>

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