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
        <AlertDialog.Title class="text-lg font-bold"
          >Service Discontinuation Notice</AlertDialog.Title
        >
        <AlertDialog.Description class="mt-2">
          Due to insufficient funding for domain and hosting costs, this service
          (including API interfaces) will be discontinued after May 30th 2025.
        </AlertDialog.Description>
      </AlertDialog.Header>
      <AlertDialog.Footer class="mt-4">
        <AlertDialog.Action>Alright</AlertDialog.Action>
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </AlertDialog.Root>
  {@render children()}
</div>
