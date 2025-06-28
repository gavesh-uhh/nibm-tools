<script lang="ts">
  import "../app.css";
  let { children } = $props();
</script>

<head>
  <title>NIBM Tools</title>
</head>

<div class="p-4 flex flex-col min-h-screen">
  {@render children()}
</div>