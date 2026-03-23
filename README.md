# Using Auth with Firestore

## Getting the current user

Import `useAuth` in any component to access the logged-in user:

```ts
import { useAuth } from '../composables/useAuth'

const { user } = useAuth()
```

`user` is a reactive ref. It is `null` when no one is logged in, and a Firebase `User` object when logged in.

---

## The user's UID

Every logged-in user has a unique `uid` that links their auth account to their Firestore data:

```ts
user.value.uid       // unique ID
user.value.email     // their email
user.value.photoURL  // their Google profile photo
```

---

## Reading from a user-specific collection

Our Firestore collections use `uid` as the document ID. To read a user's private data:

```ts
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../composables/useAuth'

const { user } = useAuth()

async function getUserProfile() {
  if (!user.value) return

  const docRef = doc(db, 'private-user-info', user.value.uid)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    console.log(docSnap.data())
  }
}
```

---

## Writing to a user-specific collection

```ts
import { doc, setDoc } from 'firebase/firestore'

async function saveUserProfile() {
  if (!user.value) return

  await setDoc(doc(db, 'private-user-info', user.value.uid), {
    username: 'jojo123',
    photoUrl: user.value.photoURL
  })
}
```

---

## Protecting UI based on login state

Use `v-if` to conditionally show content:

```vue
<div v-if="user">
  Only logged-in users see this
</div>
<div v-else>
  Please log in
</div>
```

---

## Important

- Always check `if (!user.value) return` before making Firestore calls
- Never hardcode a `uid` — always use `user.value.uid`
- Firestore security rules enforce that users can only access their own documents



# Other changes

Added base pages for:
- Home
- Login
- Profile
- Contact
- New Event
- About
- Explore


I added to `index.ts` the router, the router just swaps out which Vue component is rendered inside `<RouterView />`. Everything happens client-side instantly. The benefit is the browser does not make a request for the new HTML page, it is instantly loaded. 

I also added a `beforeEach` guard. This checks before each route if the user is logged in, if not it routes them to the login page. With this implementation we can assume in each page that the user is logged in. 

I also added template.vue to serve as a template for new pages. I just took the current template.html and transformed it into the template.vue.

``` ts
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
```


I added a composable `useAuth.ts` that returns the current user. This is a reactive ref, so it will automatically update when the user logs in or out. 

I added `firebase.ts` to handle the firebase configuration.

I added a `.env.example`. This is the template for the secrets, you can find the secrets in the firebase console under project settings. Make sure to add the secrets to the `.env` file and not `.env.example`.

I changed `App.vue` to reference the router.


# Important things to note

We are using Vue so we cannot have href tags we must use <RouterLink to="/">Home</RouterLink> instead.

We can control which pages require authentication by adding `meta: { requiresAuth: true }` to the route.