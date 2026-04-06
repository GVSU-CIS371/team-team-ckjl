<script setup lang="ts">
import { useAuth, login, logout } from '../composables/useAuth'

const { user } = useAuth()
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

			<h3>Contact Us</h3>

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