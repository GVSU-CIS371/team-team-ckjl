import { ref } from 'vue'
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth'
import { auth } from '../firebase'
import type { User } from 'firebase/auth'
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth'

const user = ref<User | null>(null)

onAuthStateChanged(auth, (firebaseUser) => {
    user.value = firebaseUser
})

export function useAuth() {
    return { user }
}

getRedirectResult(auth).catch((error) => {
    console.error(error)
})

const provider = new GoogleAuthProvider()

export function login() {
    return signInWithPopup(auth, provider)
}

export function logout() {
    signOut(auth)
}