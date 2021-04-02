<script>
export default {
  middleware: 'authenticated',

  data () {
    return {
      channels: [],
      channelInvitations: [],
      showNavigationDrawer: false,
      showEditChannelDialog: false,
      showChannelInvitationDialog: false,
      selectedChannelIndex: null
    }
  },

  fetch () {
    // todo server
    // todo fetch user
    this.channels = [
      {
        id: 1,
        name: 'Kanál A',
        description: 'Lorem ipsum',
        type: 'PUBLIC_CHANNEL'
      },
      {
        id: 2,
        name: 'Kanál B',
        description: 'Lorem ipsum',
        type: 'PUBLIC_CHANNEL'
      },
      {
        id: 3,
        name: 'Skupina C',
        description: 'Lorem ipsum',
        type: 'PRIVATE_GROUP'
      }
    ]
    this.channelInvitations = [
      {
        id: 1,
        channelName: 'Kanál F'
      }
    ]
  },

  computed: {
    publicChannels () {
      return this.channels.filter(c => c.type === 'PUBLIC_CHANNEL')
    },

    privateGroups () {
      return this.channels.filter(c => c.type === 'PRIVATE_GROUP')
    },

    appBarTitle () {
      if (this.$route.name === 'channel-id') {
        return this.channels.find(c => c.id === this.$route.params.id).name
      }
      if (this.$route.name === 'account-settings') {
        return 'Nastavení'
      }

      return 'TeamChatApp'
    }
  },

  watch: {
    selectedChannelIndex (newValue) {
      if (newValue == null) {
        this.$router.push({ name: 'index' })
      } else {
        this.$router.push({
          name: 'channel-id',
          params: {
            id: this.channels[newValue].id
          }
        })
      }
    }
  },

  methods: {
    navigateToSettings () {
      this.$router.push({ name: 'account-settings' })
    },

    acceptChannelInvitation (channelInvitation) {
      // todo server
      this.$fetch()
    }
  }
}
</script>

<template>
  <VApp>
    <VNavigationDrawer
      v-model="showNavigationDrawer"
      app
    >
      <VList>
        <VListItem>
          <VListItemAvatar>
            <VImg src="https://cdn.vuetifyjs.com/images/john.png" />
          </VListItemAvatar>
        </VListItem>

        <VListItem>
          <VListItemContent>
            <VListItemTitle class="title">
              {{ $store.state.account.loggedInUser.name }}
            </VListItemTitle>

            <VListItemSubtitle>
              {{ $store.state.account.loggedInUser.username }}
            </VListItemSubtitle>
          </VListItemContent>
        </VListItem>
      </VList>

      <VDivider />

      <VList
        dense
        nav
      >
        <VListItemGroup
          v-model="selectedChannelIndex"
          color="primary"
        >
          <VSubheader>
            Veřejné kanály
          </VSubheader>

          <VListItem
            v-for="channel in publicChannels"
            :key="channel.id"
            link
          >
            <VListItemContent>
              <VListItemTitle>
                {{ channel.name }}
              </VListItemTitle>
            </VListItemContent>
          </VListItem>

          <VSubheader>
            Soukromé skupiny
          </VSubheader>

          <VListItem
            v-for="channel in privateGroups"
            :key="channel.id"
            link
          >
            <VListItemContent>
              <VListItemTitle>
                {{ channel.name }}
              </VListItemTitle>
            </VListItemContent>
          </VListItem>
        </VListItemGroup>
      </VList>

      <VDivider />

      <VList
        dense
        nav
      >
        <VSubheader>
          Pozvánky do kanálů/skupin
        </VSubheader>

        <VListItem
          v-for="channelInvitation in channelInvitations"
          :key="channelInvitation.id"
          @click="acceptChannelInvitation(channelInvitation)"
        >
          <VListItemContent>
            <VListItemTitle>
              {{ channelInvitation.channelName }}
            </VListItemTitle>
          </VListItemContent>
        </VListItem>
      </VList>

      <template #append>
        <div
          v-if="$store.getters['account/isAdministrator'] || $store.getters['account/isModerator']"
          class="px-2 pt-2"
        >
          <CreatePublicChannelDialog />
        </div>

        <div class="pa-2">
          <CreatePrivateGroupDialog />
        </div>

        <div class="px-2 pb-2">
          <VBtn
            block
            raised
            elevation="0"
            @click="navigateToSettings"
          >
            Nastavení
          </VBtn>
        </div>
      </template>
    </VNavigationDrawer>

    <VAppBar app>
      <VAppBarNavIcon>
        <VIcon
          @click="showNavigationDrawer = !showNavigationDrawer"
        >
          mdi-menu
        </VIcon>
      </VAppBarNavIcon>

      <VToolbarTitle>
        {{ appBarTitle }}
      </VToolbarTitle>

      <VSpacer />

      <VBtn
        v-if="selectedChannelIndex != null"
        icon
        @click="showEditChannelDialog=true"
      >
        <VIcon>
          mdi-pencil
        </VIcon>
      </VBtn>

      <EditChannelDialog
        v-if="showEditChannelDialog"
        :channel="channels[selectedChannelIndex]"
        @input="showEditChannelDialog = false"
      />

      <VBtn
        v-if="selectedChannelIndex != null"
        icon
        @click="showChannelInvitationDialog=true"
      >
        <VIcon>
          mdi-account-plus
        </VIcon>
      </VBtn>

      <CreateChannelInvitationDialog
        v-if="showChannelInvitationDialog"
        :channel="channels[selectedChannelIndex]"
        @input="showChannelInvitationDialog = false"
      />
    </VAppBar>

    <VMain>
      <VContainer fluid>
        <Nuxt />
      </VContainer>
    </VMain>
  </VApp>
</template>

<style scoped lang="scss">
.message-content {
  // todo: overflow
  //overflow: auto;
}
</style>
