<script lang="ts">
	export let data;
</script>

{#if data.session}
	<span class="box" style:border-color="green">user session found in cookies</span>
	<a class="box" href="/user">user</a>
{:else}
	<span class="box" style:border-color="red">user session not found in cookies</span>
	<a class="box" href="/login">login</a>
{/if}
