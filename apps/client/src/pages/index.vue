<script setup lang="ts">
import { definePage } from 'vue-router/auto';

definePage({
  name: 'Home'
});

const isAuthenticated = useIsAuthenticated();
</script>

<template>
  <main class="container">
    <section class="hero">
      <div class="surface">
        <p>
          Join millions of players in this highly polished, profesionally crafted dungeon
          crawler roguelike AAA survival roguelite MMO Battle Royale ARPG game of the year
        </p>

        <UiButton
          :to="{ name: isAuthenticated ? 'Games' : 'Register' }"
          style="--button-size: var(--font-size-4)"
        >
          Play now
        </UiButton>
      </div>
    </section>
  </main>
</template>

<style scoped lang="postcss">
main {
  --container-size: var(--size-xl);
}

.hero {
  > .surface {
    display: grid;
    gap: var(--size-5);
    justify-items: flex-start;
    padding: var(--size-12) var(--size-8);
    > p {
      font-size: var(--font-size-4);
    }
  }
}
</style>
