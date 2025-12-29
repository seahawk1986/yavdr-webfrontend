<template>
  <!-- <v-app id="root"> -->
  <router-view v-slot="{ Component, route }">
    <transition name="slide">
      <component
        :is="Component"
        :key="route"
      />
    </transition>
  </router-view>
  <!-- </v-app> -->
</template>