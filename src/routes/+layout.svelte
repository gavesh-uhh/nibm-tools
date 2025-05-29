<script lang="ts">
  import "../app.css";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  let { children } = $props();
</script>

<head>
  <title>NIBM Tools</title>
</head>

<div class="p-4 flex flex-col min-h-screen">
  <AlertDialog.Root open={true}>
    <AlertDialog.Content class="max-w-md">
      <AlertDialog.Header>
        <AlertDialog.Title class="text-lg font-bold relative">
          🚀 We're Moving to a New Domain!
        </AlertDialog.Title>
        <AlertDialog.Description class="mt-2">
          We're migrating to a new URL. You’ll be redirected soon, but it’s not guaranteed — keep an eye out! <br>
          Make sure to bookmark it or add it to your home screen for easy access.
        </AlertDialog.Description>
      </AlertDialog.Header>
      <AlertDialog.Footer class="mt-4">
        <AlertDialog.Action>Got it! 👍</AlertDialog.Action>
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </AlertDialog.Root>
  {@render children()}
</div>

