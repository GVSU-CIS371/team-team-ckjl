<script setup lang="ts">
import { ref } from 'vue'
import { addDoc, collection, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../composables/useAuth'

const props = defineProps<{
  eventId: string
  eventTitle: string
}>()

const { user } = useAuth()

const invitedEmail = ref('')
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

async function sendInvitation() {
  if (!user.value) {
    errorMessage.value = 'You must be logged in.'
    return
  }

  if (!invitedEmail.value.trim()) {
    errorMessage.value = 'Please enter an email.'
    return
  }

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await addDoc(collection(db, 'invitations'), {
      event_id: props.eventId,
      event_title: props.eventTitle,
      invited_email: invitedEmail.value.trim(),
      invited_by_user_id: user.value.uid,
      invited_by_email: user.value.email || '',
      status: 'Sent',
      created_at: Timestamp.now(),
    })

    successMessage.value = 'Invitation sent successfully.'
    invitedEmail.value = ''
  } catch (error) {
    console.error(error)
    errorMessage.value = 'Failed to send invitation.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="invitation-panel">
    <div class="text-subtitle-1 font-weight-bold mb-2">
      Send Invitation
    </div>

    <v-text-field
      v-model="invitedEmail"
      label="Invite by email"
      variant="outlined"
      density="compact"
      bg-color="white"
    />

    <v-btn
      color="primary"
      :loading="loading"
      @click="sendInvitation"
    >
      Send Invitation
    </v-btn>

    <p v-if="successMessage" class="success-text mt-2">
      {{ successMessage }}
    </p>

    <p v-if="errorMessage" class="error-text mt-2">
      {{ errorMessage }}
    </p>
  </div>
</template>

<style scoped>
.invitation-panel {
  margin-top: 1rem;
}

.success-text {
  color: green;
  font-size: 0.9rem;
}

.error-text {
  color: #c62828;
  font-size: 0.9rem;
}
</style>