<script lang="ts">
  import { page } from "$app/stores";
  const currRoute = $derived($page.url.pathname);
</script>

<div class="flex flex-wrap gap-1 justify-center">
  <a class="nav-link icon" class:active={currRoute === "/help"} href="/help"
    >?</a
  >
  <a class="nav-link" class:active={currRoute === "/"} href="/">Lectures</a>
  <a class="nav-link" class:active={currRoute === "/paper"} href="/paper"
    >Paper</a
  >
</div>

<style>
  @property --nibm-status-card-grad {
    syntax: "<color>";
    initial-value: #2e2e2e50;
    inherits: false;
  }

  .nav-link {
    padding: 0.5rem 1.5rem;
    background: linear-gradient(135deg, var(--nibm-status-card-grad), #121212);
    color: #f9f9f9;
    border: 1px solid #333;
    border-radius: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: start;
    box-sizing: border-box;
    cursor: pointer;
    transition-property: --nibm-status-card-grad padding;
    transition-duration: 350ms;
  }

  .nav-link.icon {
    padding: 0.5rem 1rem !important;
  }

  .nav-link:hover {
    --nibm-status-card-grad: #2e2e2eff;
  }

  .nav-link.active {
    --nibm-status-card-grad: #2e2e2eff;
    padding: 0.5rem 1.8rem;
  }
</style>
