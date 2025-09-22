<template>
  <div style="color: black;">
     注册页面
   </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const confirm = ref('')
const router = useRouter()


</script>

<style scoped>
.auth-page { max-width:400px; margin:40px auto; }
.auth-page form div { margin-bottom:12px; }
</style>