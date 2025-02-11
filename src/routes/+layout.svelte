<script lang="ts">
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
  import { onMount } from "svelte";
  import "../app.css";

  let { children } = $props();
  let firstLoad = $state(false);

  onMount(() => {
    if (!localStorage.getItem("first_load")) {
      localStorage.setItem("first_load", "true");
      firstLoad = true;
    } else {
      firstLoad = false;
    }
  });
</script>

<head>
  <title>NIBM Tools</title>
</head>

<div class="p-4 flex flex-col min-h-screen">
  <AlertDialog.Root open={firstLoad}>
    <AlertDialog.Trigger></AlertDialog.Trigger>
    <AlertDialog.Content>
      <AlertDialog.Header>
        <AlertDialog.Title>⚠️ Migration to new URL</AlertDialog.Title>
        <AlertDialog.Description>
          Old shortcuts and other stuff wont work so update your shortcuts and
          stuff. Also bulk paper downloading and student finder has been
          removed.
          <br />
          -----
          <br />
          This website is at least 1.1x times faster with faith
        </AlertDialog.Description>
      </AlertDialog.Header>
      <AlertDialog.Footer>
        <AlertDialog.Cancel>Alright Buddy Shut Up</AlertDialog.Cancel>
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </AlertDialog.Root>
  {@render children()}
</div>
