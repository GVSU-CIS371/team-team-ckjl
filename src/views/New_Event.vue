<script setup lang="ts">
import { ref } from 'vue'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../composables/useAuth'

const { user } = useAuth()

const title = ref('')
const description = ref('')
const eventDate = ref('')
const eventTime = ref('')
const location = ref('')
const isPublic = ref(false)
const urgency = ref(1)
const submitting = ref(false)
const error = ref('')
const success = ref(false)

async function submitEvent() {
  if (!title.value || !eventDate.value) {
    error.value = 'Please fill in at least a title and date.'
    return
  }

  submitting.value = true
  error.value = ''

  try {
    await addDoc(collection(db, 'events'), {
      creator_id: user.value?.uid,
      creator_email: user.value?.email,
      title: title.value,
      description: description.value,
      event_date: eventDate.value,
      event_time: eventTime.value,
      location: location.value,
      priority: urgency.value,
      is_public: isPublic.value,
      created_at: Timestamp.now(),
    })

    success.value = true
    resetForm()
  } catch (err) {
    error.value = 'Something went wrong saving your event. Please try again.'
    console.error(err)
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  title.value = ''
  description.value = ''
  eventDate.value = ''
  eventTime.value = ''
  location.value = ''
  isPublic.value = false
  urgency.value = 1
}
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
      <v-container class="form-container">
        <h2 class="form-title oswald-regular">Create a New Event</h2>

        <!-- Success Alert -->
        <v-alert
          v-if="success"
          type="success"
          variant="tonal"
          closable
          class="mb-4"
          @click:close="success = false"
        >
          <v-alert-title>Event Created!</v-alert-title>
          Your event has been saved. You can create another one below or
          <RouterLink to="/explore" class="alert-link">explore all events</RouterLink>.
        </v-alert>

        <!-- Error Alert -->
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          closable
          class="mb-4"
          @click:close="error = ''"
        >
          {{ error }}
        </v-alert>

        <!-- Form Card -->
        <v-card class="form-card" elevation="4" rounded="lg" color="#E5F4E3">
          <!-- Purple accent bar at top -->
          <div class="card-accent-bar"></div>

          <div class="pa-8">
            <v-form @submit.prevent="submitEvent">
              <v-row>
                <!-- Title -->
                <v-col cols="12">
                  <v-text-field
                    v-model="title"
                    label="Event Title"
                    placeholder="e.g. Backyard BBQ"
                    required
                    prepend-inner-icon="mdi-calendar-star"
                    color="primary"
                    variant="outlined"
                    bg-color="#E5F4E3"
                  />
                </v-col>

                <!-- Description -->
                <v-col cols="12">
                  <v-textarea
                    v-model="description"
                    label="Description"
                    placeholder="Tell people what this event is about..."
                    rows="4"
                    prepend-inner-icon="mdi-text"
                    color="primary"
                    variant="outlined"
                    auto-grow
                    bg-color="#E5F4E3"
                  />
                </v-col>

                <!-- Date -->
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="eventDate"
                    label="Date"
                    type="date"
                    required
                    prepend-inner-icon="mdi-calendar"
                    color="primary"
                    variant="outlined"
                    bg-color="#E5F4E3"
                  />
                </v-col>

                <!-- Time -->
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="eventTime"
                    label="Time"
                    type="time"
                    prepend-inner-icon="mdi-clock-outline"
                    color="primary"
                    variant="outlined"
                    bg-color="#E5F4E3"
                  />
                </v-col>

                <!-- Location -->
                <v-col cols="12">
                  <v-text-field
                    v-model="location"
                    label="Location"
                    placeholder="e.g. 123 Main St, Grand Rapids, MI"
                    prepend-inner-icon="mdi-map-marker"
                    color="primary"
                    variant="outlined"
                    bg-color="#E5F4E3"
                  />
                </v-col>

                <!-- Urgency -->
                <v-col cols="12">
                  <div class="urgency-label">
                    <v-icon color="primary" size="small">mdi-alert-circle-outline</v-icon>
                    <span>Priority: <strong>{{ urgency }}</strong> / 5</span>
                  </div>
                  <v-slider
                    v-model="urgency"
                    :min="1"
                    :max="5"
                    :step="1"
                    color="primary"
                    track-color="secondary"
                    show-ticks="always"
                    tick-size="4"
                  >
                    <template v-slot:prepend>
                      <span class="text-caption text-medium-emphasis">Low</span>
                    </template>
                    <template v-slot:append>
                      <span class="text-caption text-medium-emphasis">High</span>
                    </template>
                  </v-slider>
                </v-col>

                <!-- Public Toggle -->
                <v-col cols="12">
                  <v-switch
                    v-model="isPublic"
                    color="primary"
                    :label="isPublic ? 'Public — Anyone can see and explore this event.' : 'Private — Only invited guests can see this event.'"
                    inset
                    prepend-icon="mdi-earth"
                  />
                </v-col>

                <!-- Submit -->
                <v-col cols="12">
                  <v-btn
                    type="submit"
                    size="large"
                    block
                    :loading="submitting"
                    prepend-icon="mdi-plus-circle"
                    class="submit-btn"
                  >
                    Create Event
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </div>
        </v-card>
      </v-container>
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
.form-container {
  max-width: 800px;
}

.form-title {
  color: #6D326D;
  font-size: 2em;
  margin-bottom: 0.75em;
  text-align: center;
}

.form-card {
  border: 1px solid #e0e0e0;
  overflow: hidden;
}

.card-accent-bar {
  height: 6px;
  background: linear-gradient(to right, #6D326D, #83a85e);
  width: 100%;
}

.form-card .v-field__field,
.form-card .v-field {
  background-color: #f5f5f5 !important;
}

.urgency-label {
  display: flex;
  align-items: center;
  gap: 0.4em;
  margin-bottom: 0.25em;
  font-size: 0.95em;
  color: #4a4a4a;
}

.alert-link {
  color: #6D326D;
  font-weight: 600;
}

.submit-btn {
  background-color: #6D326D !important;
  color: white !important;
}
</style>