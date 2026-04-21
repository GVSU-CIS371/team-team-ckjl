<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../composables/useAuth'

const props = defineProps<{
  eventId: string
}>()

const { user } = useAuth()

interface CommentItem {
  id: string
  event_id: string
  user_id: string
  user_email: string
  user_name: string
  content: string
  created_at?: any
}

const comments = ref<CommentItem[]>([])
const newComment = ref('')
const loadingComments = ref(false)
const submittingComment = ref(false)
const errorMessage = ref('')

async function loadComments() {
  if (!props.eventId) return

  loadingComments.value = true
  errorMessage.value = ''

  try {
    const q = query(
      collection(db, 'comments'),
      where('event_id', '==', props.eventId),
    )

    const snapshot = await getDocs(q)
    comments.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as CommentItem[]

    comments.value.sort((a, b) => {
      const aTime = a.created_at?.seconds || 0
      const bTime = b.created_at?.seconds || 0
      return aTime - bTime
    })

  } catch (error) {
    console.error('Error loading comments:', error)
    errorMessage.value = 'Could not load comments.'
  } finally {
    loadingComments.value = false
  }
}

async function submitComment() {
  if (!user.value) {
    errorMessage.value = 'You must be logged in to comment.'
    return
  }

  const trimmedComment = newComment.value.trim()

  if (!trimmedComment) {
    errorMessage.value = 'Please enter a comment.'
    return
  }

  submittingComment.value = true
  errorMessage.value = ''

  try {
    const commentData = {
      event_id: props.eventId,
      user_id: user.value.uid,
      user_email: user.value.email || '',
      user_name: user.value.displayName || user.value.email || 'Anonymous',
      content: trimmedComment,
      created_at: Timestamp.now(),
    }

    const docRef = await addDoc(collection(db, 'comments'), commentData)

    newComment.value = ''
    await loadComments()
  } catch (error) {
    console.error('Error adding comment:', error)
    errorMessage.value = 'Could not post comment.'
  } finally {
    submittingComment.value = false
  }
}

function formatCommentDate(timestamp: any) {
  if (!timestamp?.toDate) return ''
  return timestamp.toDate().toLocaleString()
}

watch(
  () => props.eventId,
  () => {
    comments.value = []
    loadComments()
  },
  { immediate: true }
)

onMounted(loadComments)
</script>

<template>
  <div class="comments-section">
    <div class="text-subtitle-1 font-weight-bold mb-3">Comments</div>

    <div v-if="loadingComments" class="text-center py-4">
      <v-progress-circular indeterminate color="primary" size="28" />
    </div>

    <div v-else-if="comments.length === 0" class="text-grey mb-4">
      No comments yet. Be the first to leave one.
    </div>

    <div v-else class="comments-list mb-4">
      <v-card
        v-for="comment in comments"
        :key="comment.id"
        class="mb-3"
        variant="outlined"
        rounded="lg"
        color="white"
      >
        <v-card-text>
          <div class="comment-header">
            <strong>{{ comment.user_name || comment.user_email }}</strong>
            <span class="comment-date">{{ formatCommentDate(comment.created_at) }}</span>
          </div>
          <div class="comment-body">
            {{ comment.content }}
          </div>
        </v-card-text>
      </v-card>
    </div>

    <div v-if="user" class="comment-form">
      <v-textarea
        v-model="newComment"
        label="Add a comment"
        variant="outlined"
        rows="3"
        auto-grow
        counter="300"
        maxlength="300"
        bg-color="white"
      />
      <v-btn
        color="primary"
        :loading="submittingComment"
        @click="submitComment"
      >
        Post Comment
      </v-btn>
    </div>

    <div v-else class="text-grey">
      Log in to leave a comment.
    </div>

    <div v-if="errorMessage" class="error-text mt-2">
      {{ errorMessage }}
    </div>
  </div>
</template>

<style scoped>
.comments-section {
  margin-top: 1rem;
}

.comments-list {
  display: flex;
  flex-direction: column;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.4rem;
  flex-wrap: wrap;
}

.comment-header strong {
  color: #E5F4E3;
}

.comment-date {
  font-size: 0.8rem;
  color: #777;
}

.comment-body {
  color: #222;
  background-color: white;
  white-space: pre-wrap;
  word-break: break-word;
}

.error-text {
  color: #c62828;
  font-size: 0.9rem;
}
</style>