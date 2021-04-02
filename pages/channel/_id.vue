<script>
import { io } from 'socket.io-client'

export default {
  asyncData () {
    return {
      messages: [
        {
          id: 1,
          threadId: 10,
          creator: {
            id: 1,
            name: 'Pepa'
          },
          created: Date.now(),
          content: 'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.'
        },
        {
          id: 2,
          threadId: 10,
          creator: {
            id: 1,
            name: 'Pepa'
          },
          created: Date.now(),
          content: 'Toto je moje zpráva 2'
        }
      ]
    }
  },

  data () {
    return {
      socket: io(`ws://${window.location.hostname}/api/messages`),
      messages: [],
      selectedThreadId: null,
      showThreadDialog: false
    }
  },

  fetch () {
    this.messages = [
      {
        id: 1,
        threadId: 10,
        creator: {
          id: 1,
          name: 'Pepa'
        },
        created: Date.now(),
        content: 'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.'
      },
      {
        id: 2,
        threadId: 10,
        creator: {
          id: 1,
          name: 'Pepa'
        },
        created: Date.now(),
        content: 'Toto je moje zpráva 2'
      }
    ]
  },

  created () {
    this.socket.on('newMessage', function (newMessage) {
      this.messages.push(newMessage)
    })
  },

  methods: {
    showThread (message) {
      this.selectedThreadId = message.threadId
      this.showThreadDialog = true
    }
  }
}
</script>

<template>
  <div class="channel-container">
    <CreateMessageForm
      :socket="socket"
      :channel-id="$route.params.id"
    />

    <VList>
      <VListItem
        v-for="message in messages"
        :key="message.id"
        @click="showThread(message)"
      >
        <VListItemAvatar>
          <VImg src="https://cdn.vuetifyjs.com/images/john.png" />
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

    <ThreadDialog
      v-if="showThreadDialog"
      :socket="socket"
      :thread-id="selectedThreadId"
      @messagesUpdated="$fetch"
      @input="showThreadDialog = false"
    />
  </div>
</template>

<style scoped lang="scss">
.message-content {
  // todo: overflow
  //overflow: auto;
}
</style>
