<script setup lang="ts">
import { useAuth } from '../composables/useAuth'
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth'
import { auth } from '../firebase'

const {user} = useAuth();
const provider = new GoogleAuthProvider()

function login() {
  const provider = new GoogleAuthProvider()
  signInWithPopup(auth, provider)
}

function logout() {
  signOut(auth)
}
</script>

<template>
	<div v-if="user">
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
						<RouterLink to="/"><img class="tablet-desktop" src="" alt="Occurency Logo"></RouterLink>
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

				<p>Welcome, {{ user.email }}</p>
				<button @click="logout">Logout</button>

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
	</div>
	<div v-else>
		<h2>Login</h2>
		<p>Current user: {{ user }}</p>
		<button @click="login">Login with Google</button>
	</div>
</template>

<style scoped></style>
