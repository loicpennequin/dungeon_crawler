<script setup lang="ts">
import type { ButtonProps } from './UiButtonBase.vue';

defineOptions({
  name: 'UiIconButton'
});

type Props = Omit<ButtonProps, 'leftIcon' | 'right-icon'> & {
  icon: string;
  title: string;
  isLoading?: boolean;
};
const props = withDefaults(defineProps<Props>(), {
  to: undefined
});

const buttonProps = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { icon, ...rest } = props;
  return rest;
});
</script>

<template>
  <UiGhostButton class="ui-icon-button" v-bind="buttonProps" :aria-label="props.title">
    <UiIcon :name="props.icon" />
  </UiGhostButton>
</template>

<style scoped lang="postcss">
.ui-icon-button {
  padding: var(--size-1);
  border-radius: var(--radius-round);
}
</style>
s
