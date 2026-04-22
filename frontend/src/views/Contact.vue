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
					<RouterLink to="/"><img class="tablet-desktop" src="../images/occurency_logo.png" alt="Occurency Logo"></RouterLink>
					<h2 class="slogan oswald-regular">Your greatest memories start here</h2>
				</figure>
				<div v-if="user" class="login-container">
					<p class="login-text">Welcome, {{ user.displayName || user.email }}</p>
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
	
		<h2>Want to reach out? Contact Us!</h2>
	
		<div class="contact-page-num">
			<div class="contact-stack">
				<h3>Phone Number</h3>
				<p>(622) 873-6297</p>
			
				<h3>Email</h3>
				<p>OccurencyInc@gmail.com</p>
			</div>
		</div>
		
		<h3>Follow us on Social Media!</h3>
		
		<div class="contact-page-media">
		
				<div class="contact-stack">
					<h4>Instagram</h4>
					<a href="https://instagram.com"><img class="tablet-desktop" src="../images/insta_occur.png" alt="Instagram Logo"></a>
				</div>
				
				<div class="contact-stack">
					<h4>Twitter</h4>
					<a href="https://x.com/"><img class="tablet-desktop" src="../images/twitter_occur.png" alt="Twitter Logo"></a>
				</div>
				
				<div class="contact-stack">
					<h4>Facebook</h4>
					<a href="https://facebook.com"><img class="tablet-desktop" src="../images/facebook_occur.png" alt="Facebook Logo"></a>
				</div>
				
				<div class="contact-stack">
					<h4>TikTok</h4>
					<a href="https://tiktok.com"><img class="tablet-desktop" src="../images/tiktok_occur.png" alt="TikTok Logo"></a>
				</div>
				
		</div>
	
		<hr>
	
		<div class="content-stack">
	
			<h3>Occurency HQ Address</h3>
			<p>1 Campus Dr, Allendale, MI</p>
			<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2919.6715274116314!2d-85.89161532475342!3d42.96412599672635!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8819a31f0c9d398f%3A0xea0367b3e0ec32fa!2sGrand%20Valley%20State%20University!5e0!3m2!1sen!2sus!4v1776428818262!5m2!1sen!2sus" width="700" height="300" style="google-map" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
	
		</div>
		
		<hr>
		
		<div class="contact-form">
	    <h3>Have An Opinion? We'd Love To Know!</h3>
	    <form action="mailto:OccurencyInc@gmail.com" method="POST">
	        <label for="name">Name:</label>
	        <input type="text" name="name" placeholder="Name" required>
	
	        <label for="email">Email:</label>
	        <input type="email" name="email" placeholder="Email" required>
	
	        <label for="access">How Would You Rate The Sites Accessibility?</label>
	        <select id="access" name="access" required>
	            <option value="vp1">Very Poor</option>
	            <option value="p1">Poor</option>
	            <option value="ok1">Ok</option>
	            <option value="g1" selected>Good</option>
	            <option value="vg1">Very Good</option>
	        </select>
	
	        <label for="appear">How Would You Rate The Sites Appearance?</label>
	        <select id="appear" name="appear" required>
	            <option value="vp2">Very Poor</option>
	            <option value="p2">Poor</option>
	            <option value="ok2">Ok</option>
	            <option value="g2" selected>Good</option>
	            <option value="vg2">Very Good</option>
	        </select>
	
	        <label for="oc">Other Comments:</label>
	        <textarea name="oc" placeholder="Your Comments"></textarea>
	
	        <button type="submit">Submit</button>
	    </form>
	</div>
		
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
