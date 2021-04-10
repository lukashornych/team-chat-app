<script>
export default {
  name: 'ThreadDialog',

  props: {
    socket: {
      type: Object,
      required: true
    },
    threadId: {
      type: Number,
      required: true
    },
    messages: {
      type: Array,
      required: true
    }
  }
}
</script>

<template>
  <VDialog
    :value="true"
    max-width="600"
    @input="$emit('input', $event)"
  >
    <VCard>
      <VCardTitle class="headline">
        Vlákno
      </VCardTitle>

      <CreateMessageForm
        :socket="socket"
        :thread-id="threadId"
      />

      <VList>
        <VListItem
          v-for="message in messages"
          :key="message.id"
        >
          <VListItemAvatar>
            <VImg :src="`/api/getAccountPhoto/${message.creator.id}`" />
          </VListItemAvatar>

          <VListItemContent>
            <VListItemTitle>
              {{ message.creator.name }}
            </VListItemTitle>

            <VListItemSubtitle class="message-content">
              {{ message.content }}
            </VListItemSubtitle>
          </VListItemContent>
        </VListItem>
      </VList>

      <VCardActions>
        <VSpacer />
        <VBtn
          color="darken-1"
          text
          @click="$emit('input', false)"
        >
          Zavřít
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style lang="scss" scoped>

</style>
