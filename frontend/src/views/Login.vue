<script setup lang="ts">
import { login, logout } from '../composables/useAuth'
import { useAuth } from '../composables/useAuth'
import { useRouter, useRoute } from 'vue-router'

const { user } = useAuth()
const router = useRouter()
const route = useRoute()

const handleLogin = async () => {
	try {
		await login()
		const redirectPath = route.query.redirect as string || '/'
		router.push(redirectPath)
	} catch (error) {
		console.error("Login failed:", error)
	}
}
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
				</figure>	
			</div>
		</header>

		<main>
			<h2>You must be logged in to see this page.</h2>
			<button class="login-button" @click="handleLogin">Login with Google</button>
		</main>

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
.login-main-container,
.logout-main-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20px;
	padding: 40px;
	background-color: rgba(255, 255, 255, 0.8);
	border-radius: 12px;
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
	border: 1px solid #eaeaea;
	margin: 40px auto;
	max-width: 400px;
	text-align: center;
}

.login-main-container h2,
.logout-main-container h2 {
	color: #374151;
	font-size: 1.5rem;
	margin: 0;
}
</style>
