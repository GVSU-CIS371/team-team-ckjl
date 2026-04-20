<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth, login, logout } from '../composables/useAuth'
import InvitationPanel from '../components/InvitationPanel.vue'

const { user } = useAuth()

interface EventItem {
  id: string
  title: string
  description: string
  event_date: string
  event_time: string
  location: string
  creator_id: string
  creator_email: string
  creator_name: string
  is_public: boolean
}

const createdEvents = ref<EventItem[]>([])
const loading = ref(false)

async function loadCreatedEvents() {
  if (!user.value) {
    createdEvents.value = []
    return
  }

  loading.value = true

  try {
    const q = query(
      collection(db, 'events'),
      where('creator_id', '==', user.value.uid)
    )

    const snapshot = await getDocs(q)
    createdEvents.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as EventItem[]
  } catch (error) {
    console.error('Error loading created events:', error)
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  const d = new Date(Number(year), Number(month) - 1, Number(day))
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(timeStr: string) {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':')
  const d = new Date()
  d.setHours(Number(h), Number(m))
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

watch(user, () => {
  loadCreatedEvents()
})

onMounted(loadCreatedEvents)
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
					<RouterLink to="/"><img class="tablet-desktop" src="../images/occurency_temp_logo.png" alt="Occurency Logo"></RouterLink>
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

		<main>
			<div v-if="!user">
				<h2>You must be logged in to see this page.</h2>
				<button class="login-button" @click="login">Login with Google</button>
			</div>
			<div v-else>
  			  <v-container class="profile-container">
    			<h2 class="profile-title oswald-regular">Your Profile</h2>

    			<p class="welcome-text">Signed in as {{ user.email }}</p>

    			<div v-if="loading" class="text-center py-6">
      			  <v-progress-circular indeterminate color="primary" size="40" />
    			</div>

    			<div v-else-if="createdEvents.length === 0" class="empty-state">
      			  <p>You have not created any events yet.</p>
      			  <RouterLink to="/new-event">Create your first event</RouterLink>
    			</div>

    			<v-row v-else>
      			  <v-col
        		    v-for="event in createdEvents"
        		    :key="event.id"
        		    cols="12"
       			    md="6"
      			  >
        			<v-card class="event-card" elevation="3" rounded="lg" color="#E5F4E3">
          			  <v-card-title class="font-weight-bold">
            			{{ event.title }}
          			  </v-card-title>

          			  <v-card-subtitle>
            			<div>{{ formatDate(event.event_date) }}</div>
           				<div v-if="event.event_time">{{ formatTime(event.event_time) }}</div>
            			<div v-if="event.location">{{ event.location }}</div>
          			  </v-card-subtitle>

          			  <v-card-text>
            			<p v-if="event.description" class="mb-4">
              			  {{ event.description }}
            			</p>

            			<p class="text-caption mb-4">
              			  {{ event.is_public ? 'Public Event' : 'Private Event' }}
            			</p>

            			<InvitationPanel
              			  :eventId="event.id"
              			  :eventTitle="event.title"
            			/>
          		      </v-card-text>
        			</v-card>
      			  </v-col>
    			</v-row>
  			  </v-container>
		    </div>
		</main>

		<footer class="oswald-regular">

			<p>&#169; Copyright 2026. All Rights Reserved.</p>
			<p>555-666-7777</p>
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
.event-card {
  margin-bottom: 1rem;
}
</style>