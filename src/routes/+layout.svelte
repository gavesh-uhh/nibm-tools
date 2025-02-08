<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
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
  <div class="flex flex-row gap-1 justify-center items-center">
    <Button
      href="https://www.gavesh.live"
      class="mr-1"
      size="icon"
      variant="outline"
    >
      ❤️
    </Button>
    <h1 class="text-xl">
      <span class="text-blue-500 font-bold">NIBM</span>
      <span class="left-[-2px] relative opacity-40">.gavesh.live</span>
    </h1>
  </div>
  {@render children()}
</div>

