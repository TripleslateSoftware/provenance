<script lang="ts">
	export let data;
</script>

<a class="box" href={data.user.url}>
	<img src={data.user.avatarUrl} alt="{data.user.username} github avatar" width="100px" />
	<b>
		{data.user.username}
	</b>
</a>
<div>
	<a class="box" style:border-color="red" href="/logout">logout</a>
	<a
		class="box"
		style:border-color="red"
		href="https://github.com/settings/connections/applications/{data.clientId}">revoke access</a
	>
</div>

<style>
	div {
		display: flex;
		gap: 10px;
	}
</style>
