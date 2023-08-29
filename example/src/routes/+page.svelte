<script lang="ts">
	export let data;
</script>

{#if data.session}
	<span class="box" style:border-color="green">user session found in cookies</span>
	<div>
		<a class="box" style:border-color="red" href="/logout">logout</a>
		<a class="box" href="/user">user</a>
	</div>
{:else}
	<span class="box" style:border-color="red">user session not found in cookies</span>
	<a class="box" href="/login">login</a>
{/if}

<style>
	div {
		display: flex;
		gap: 10px;
	}
</style>
