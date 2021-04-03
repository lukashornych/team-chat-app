<script>
export default {
  middleware: 'not-authenticated'
}
</script>

<template>
  <VApp>
    <VMain>
      <VContainer fluid>
        <div class="auth-container">
          <h1>Team Chat App</h1>

          <Nuxt />
        </div>
      </VContainer>
    </VMain>
  </VApp>
</template>

<style lang="scss" scoped>
.auth-container {
  max-width: 30rem;
  text-align: center;
  margin: 0 auto;

  h1 {
    margin: 4rem 0;
  }
}
</style>
