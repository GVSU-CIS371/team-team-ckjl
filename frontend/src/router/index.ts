import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Profile from '../views/Profile.vue'
import Explore from '../views/Explore.vue'
import About from '../views/About.vue'
import Contact from '../views/Contact.vue'
import NewEvent from '../views/New_Event.vue'
import { auth } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/profile', component: Profile, meta: { requiresAuth: true } },
    { path: '/explore', component: Explore, meta: { requiresAuth: true } },
    { path: '/about', component: About, meta: { requiresAuth: true } },
    { path: '/contact', component: Contact, meta: { requiresAuth: true } },
    { path: '/new-event', component: NewEvent, meta: { requiresAuth: true } },
  ],
})


// Wait for Firebase to initialize auth state
const getCurrentUser = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    })
  })
}

router.beforeEach(async (to, from) => {
  const user = await getCurrentUser()

  if (to.meta.requiresAuth && !user) {
    return { path: '/login', query: { redirect: to.path } }
  }
})


export default router
