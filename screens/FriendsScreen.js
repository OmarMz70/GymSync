import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const INITIAL_FRIENDS = [
  { id: 1, name: 'Abdullah', workout: 'Push', status: 'in_gym' },
  { id: 2, name: 'Khalid', workout: 'Legs', status: 'will_go' },
  { id: 3, name: 'Faisal', workout: null, status: 'wont_go' },
  { id: 4, name: 'Sultan', workout: 'Pull', status: 'already_went' },
  { id: 5, name: 'Turki', workout: null, status: 'will_go' },
];

const INITIAL_GROUPS = [
  { id: 1, name: 'Push Bros', members: ['Abdullah', 'Khalid', 'Omar'] },
  { id: 2, name: 'The Squad', members: ['Abdullah', 'Khalid', 'Sultan', 'Turki', 'Omar'] },
];

const statusOrder = { will_go: 0, in_gym: 1, already_went: 2, wont_go: 3 };

const getStatusLabel = (status) => {
  switch (status) {
    case 'in_gym': return 'In the gym';
    case 'will_go': return 'Will go';
    case 'wont_go': return "Won't go";
    case 'already_went': return 'Already went';
    default: return '';
  }
};

export default function FriendsScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  const [friends] = useState(INITIAL_FRIENDS);
  const [groups, setGroups] = useState(INITIAL_GROUPS);

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [userId, setUserId] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState(new Set());

  const sorted = [...friends].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_gym': return theme.inGym;
      case 'will_go': return theme.willGo;
      case 'wont_go': return theme.wontGo;
      case 'already_went': return theme.alreadyWent;
      default: return theme.border;
    }
  };

  const closeAddModal = () => { setAddModalVisible(false); setUserId(''); setRequestSent(false); };

  const toggleMember = (name) => {
    setSelectedMembers(prev => { const next = new Set(prev); next.has(name) ? next.delete(name) : next.add(name); return next; });
  };

  const handleCreateGroup = () => {
    if (!groupName.trim() || selectedMembers.size === 0) return;
    setGroups(prev => [...prev, { id: Date.now(), name: groupName.trim(), members: ['Omar', ...Array.from(selectedMembers)] }]);
    setGroupModalVisible(false);
    setGroupName('');
    setSelectedMembers(new Set());
  };

  const closeGroupModal = () => { setGroupModalVisible(false); setGroupName(''); setSelectedMembers(new Set()); };
  const canCreate = groupName.trim().length > 0 && selectedMembers.size > 0;

  return (
    <>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Friends</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
            <Text style={styles.addButtonText}>Add +</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselContent} style={styles.carousel}>
          {groups.map((group) => (
            <TouchableOpacity key={group.id} style={styles.groupCard} onPress={() => navigation.navigate('GroupDetail', { group })}>
              <Text style={styles.groupCardName} numberOfLines={1}>{group.name}</Text>
              <Text style={styles.groupCardMeta}>{group.members.length} members</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.newGroupCard} onPress={() => setGroupModalVisible(true)}>
            <Text style={styles.newGroupPlus}>+</Text>
            <Text style={styles.newGroupLabel}>New Group</Text>
          </TouchableOpacity>
        </ScrollView>

        <Text style={styles.listLabel}>YOUR FRIENDS</Text>

        {sorted.map((friend) => (
          <View key={friend.id} style={styles.friendCard}>
            <View style={styles.feedLeft}>
              <View style={[styles.feedAvatar, { backgroundColor: getStatusColor(friend.status) }]}>
                <Text style={styles.feedAvatarText}>{friend.name[0]}</Text>
              </View>
              <View>
                <Text style={styles.friendName}>{friend.name}</Text>
                {friend.workout && <Text style={styles.friendWorkout}>{friend.workout} day</Text>}
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(friend.status) + '22' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(friend.status) }]}>{getStatusLabel(friend.status)}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add Friend Modal */}
      <Modal visible={addModalVisible} transparent animationType="slide" onRequestClose={closeAddModal}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeAddModal} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            {requestSent ? (
              <>
                <Text style={styles.modalTitle}>Request Sent!</Text>
                <Text style={styles.modalSub}>They'll appear in your friends list once they accept.</Text>
                <TouchableOpacity style={styles.doneButton} onPress={closeAddModal}>
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Add Friend</Text>
                <Text style={styles.modalSub}>Enter your friend's GymSync ID to send them a request.</Text>
                <TextInput style={styles.modalInput} placeholder="e.g. #48291" placeholderTextColor={theme.subtext} value={userId} onChangeText={(val) => setUserId(val.replace(/[^0-9]/g, ''))} keyboardType="number-pad" maxLength={8} />
                <TouchableOpacity style={[styles.primaryButton, !userId.trim() && styles.buttonDisabled]} onPress={() => setRequestSent(true)} disabled={!userId.trim()}>
                  <Text style={styles.primaryButtonText}>Send Request</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={closeAddModal}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Create Group Modal */}
      <Modal visible={groupModalVisible} transparent animationType="slide" onRequestClose={closeGroupModal}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeGroupModal} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Create Group</Text>
            <Text style={styles.modalSub}>Name your group and pick who's in it.</Text>
            <TextInput style={styles.modalInput} placeholder="Group name" placeholderTextColor={theme.subtext} value={groupName} onChangeText={setGroupName} />
            <Text style={styles.pickLabel}>Add members</Text>
            {friends.map((friend) => {
              const selected = selectedMembers.has(friend.name);
              return (
                <TouchableOpacity key={friend.id} style={[styles.memberRow, selected && styles.memberRowSelected]} onPress={() => toggleMember(friend.name)}>
                  <View style={[styles.memberAvatar, { backgroundColor: getStatusColor(friend.status) }]}>
                    <Text style={styles.memberAvatarText}>{friend.name[0]}</Text>
                  </View>
                  <Text style={[styles.memberName, selected && styles.memberNameSelected]}>{friend.name}</Text>
                  <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                    {selected && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity style={[styles.primaryButton, { marginTop: 16 }, !canCreate && styles.buttonDisabled]} onPress={handleCreateGroup} disabled={!canCreate}>
              <Text style={styles.primaryButtonText}>Create Group{selectedMembers.size > 0 ? ` (${selectedMembers.size + 1})` : ''}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={closeGroupModal}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

function makeStyles(t) {
  return StyleSheet.create({
    scrollView: { flex: 1, backgroundColor: t.bg },
    scrollContent: { paddingTop: 60, paddingBottom: 40 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 20 },
    screenTitle: { fontSize: 32, fontWeight: 'bold', color: t.text },
    addButton: { backgroundColor: t.accent, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
    addButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
    carousel: { marginBottom: 28 },
    carouselContent: { paddingHorizontal: 24, gap: 12 },
    groupCard: { width: 130, backgroundColor: t.card, borderRadius: 16, padding: 14, borderWidth: 0.5, borderColor: t.border, justifyContent: 'space-between', minHeight: 80 },
    groupCardName: { color: t.text, fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
    groupCardMeta: { color: t.subtext, fontSize: 12 },
    newGroupCard: { width: 100, borderRadius: 16, borderWidth: 1.5, borderColor: t.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 6 },
    newGroupPlus: { color: t.subtext, fontSize: 28, lineHeight: 32 },
    newGroupLabel: { color: t.subtext, fontSize: 12 },
    listLabel: { fontSize: 11, fontWeight: 'bold', color: t.subtext, letterSpacing: 1.2, paddingHorizontal: 24, marginBottom: 12 },
    friendCard: { backgroundColor: t.card, borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginHorizontal: 24, borderWidth: 0.5, borderColor: t.border },
    feedLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    feedAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    feedAvatarText: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
    friendName: { color: t.text, fontSize: 16, fontWeight: 'bold' },
    friendWorkout: { color: t.subtext, fontSize: 13, marginTop: 2 },
    statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
    statusText: { fontSize: 12, fontWeight: 'bold' },
    modalOverlay: { flex: 1, justifyContent: 'flex-end' },
    modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
    modalSheet: { backgroundColor: t.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, borderWidth: 0.5, borderColor: t.border },
    modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: t.border, alignSelf: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: t.text, marginBottom: 6 },
    modalSub: { fontSize: 14, color: t.subtext, marginBottom: 20 },
    modalInput: { backgroundColor: t.inputBg, borderRadius: 10, padding: 16, color: t.text, fontSize: 15, borderWidth: 0.5, borderColor: t.border, marginBottom: 16 },
    primaryButton: { backgroundColor: t.accent, borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12 },
    buttonDisabled: { opacity: 0.4 },
    primaryButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
    cancelButton: { padding: 14, alignItems: 'center' },
    cancelButtonText: { color: t.subtext, fontSize: 15 },
    doneButton: { backgroundColor: t.alreadyWent, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
    doneButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
    pickLabel: { fontSize: 13, fontWeight: 'bold', color: t.subtext, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
    memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 10, marginBottom: 6, borderWidth: 0.5, borderColor: t.border },
    memberRowSelected: { borderColor: t.accentLight, backgroundColor: t.accent + '18' },
    memberAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    memberAvatarText: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' },
    memberName: { flex: 1, color: t.text, fontSize: 15 },
    memberNameSelected: { color: t.accentLight, fontWeight: '600' },
    checkbox: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: t.border, alignItems: 'center', justifyContent: 'center' },
    checkboxSelected: { backgroundColor: t.accentLight, borderColor: t.accentLight },
    checkmark: { color: '#ffffff', fontSize: 13, fontWeight: 'bold' },
  });
}
