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

	<main class="oswald-regular">
		<h2>About Occurency</h2>
		
		<br>
		
		<!-- Our Story -->
		<h2>Our Story</h2>
		<div>
			
				<p>
				We started as a team of 4 friends who wanted to bring our events to a wider audience, which then evolved to a little side project called "Occurency". 
				We wanted to create a platform that would make it easy for people to discover and attend events in their local area, and to connect with others who share their interests. 
				</p>
			
				<br>
				
				<p>And in the end, we succeeded.</p>
				
				<br>
				
				<p>
				Occurency is a software service designed to bring people together for unforgettable experiences. 
				Using our platform, users can create and find events that match their interests, whether it's a local concert, a block party, or soemthing entirely new. 
				</p>
				<img class="tablet-desktop abt-img" src="images/occurency_abt_OS_SI2.jpg" alt="Occurency developers sitting around a laptop">
		</div>
		
		<!-- Our Mission -->
		<h2>Our Mission</h2>
		<div>
				<p>
				Our mission is to help people create lasting memories by connecting them with events that inspire and excite them. 
				At Occurency, our belief is that life is about the experiences and memories we share with others, and we're here to make those memories happen.
				</p>
				
				<p>
				We strive to build a welcoming and inclusive platform where anyone can discover something new, meet like-minded individuals, and turn everyday moments into meaningful experiences.
				</p>
				<img class="tablet-desktop abt-img" src="images/occurency_abt_OM_SI1.jpg" alt="A group of people sitting happily around the dining table at an event planned with Occurency">
		</div>

		<!-- Our Team (Tablet/Desktop Only) -->
		<div class="tablet-desktop">
			<h2>Our Team</h2>
				<p>
				Our team is passionate about creating a user-friendly platform that fosters community and engagement, and we're committed to providing excellent customer service and support to our users.
				</p>
				<p>The team consists of 4 members:</p>
				<p><b>Chad - Event & RSVP Coordinator</b> | <b>Kyle - Frontend Developer</b> | <b>Josh - User & Login Specialist</b> | <b>Leon - Community Builder</b></p>
				<p>Together, we're dedicated to making Occurency the go-to platform for event discovery and creation, and we can't wait to see the amazing memories that our users will create with us.</p>
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