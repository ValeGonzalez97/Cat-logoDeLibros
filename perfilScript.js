const fs = require('fs');
let code = fs.readFileSync('c:/Proyectos/libros/app/(tabs)/index.tsx', 'utf8');

code = code.replace(
  'import { Dimensions, Image, Share, RefreshControl, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from \'react-native\';',
  'import { Dimensions, Image, Share, RefreshControl, ScrollView, StyleSheet, TextInput, TouchableOpacity, View, Modal, Linking, KeyboardAvoidingView, Platform } from \'react-native\';\nimport * as ImagePicker from \'expo-image-picker\';'
);

code = code.replace(
  'import { Book } from \'@/types/database\';',
  'import { Book, Perfil } from \'@/types/database\';'
);

code = code.replace(
  'const [search, setSearch] = useState(\'\');',
  \const [search, setSearch] = useState('');\\n  const [profile, setProfile] = useState<Perfil | null>(null);\\n  const [profileModal, setProfileModal] = useState(false);\\n  const [editNombre, setEditNombre] = useState('');\\n  const [editDesc, setEditDesc] = useState('');\\n  const [editGustos, setEditGustos] = useState('');\\n  const [editFoto, setEditFoto] = useState('');\\n  const [shareModal, setShareModal] = useState(false);\\n  const [bookToShare, setBookToShare] = useState<Book | null>(null);\
);

code = code.replace(
  'const books = await BooksService.getBooks();\\n      setMyBooks(books);',
  \const books = await BooksService.getBooks();\\n      setMyBooks(books);\\n      const userProfile = await BooksService.getProfile();\\n      if (userProfile) { setProfile(userProfile); }\
);

let pblock = \  const openProfile = () => {
    setEditNombre(profile?.nombre || 'Usuario Lector');
    setEditDesc(profile?.descripcion || '');
    setEditGustos(profile?.gustos || '');
    setEditFoto(profile?.foto_url || '');
    setProfileModal(true);
  };
  const saveProfile = async () => {
    try {
      await BooksService.updateProfile({ nombre: editNombre, descripcion: editDesc, gustos: editGustos, foto_url: editFoto });
      setProfileModal(false);
      loadData();
    } catch(e) {}
  };
  const pickProfileImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.5, base64: true });
    if (!result.canceled && result.assets[0].base64) setEditFoto('data:image/jpeg;base64,' + result.assets[0].base64);
  };\\n\

code = code.replace(
  'const onRefresh = async () => {', pblock + '  const onRefresh = async () => {'
);


let headerBlock = \        {/* Perfil Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 10, justifyContent: 'space-between' }}>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={openProfile}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: designColors.surfaceContainerHighest, overflow: 'hidden' }}>
              {profile?.foto_url ? <Image source={{uri: profile.foto_url}} style={{width: 40, height: 40}} /> : <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}><ThemedText style={{color: '#6e797e'}}>U</ThemedText></View>}
            </View>
            <View style={{ marginLeft: 12 }}>
              <ThemedText style={{ fontSize: 16, fontWeight: 'bold', color: designColors.primary }}>{profile?.nombre || 'Usuario Lector'}</ThemedText>
            </View>
          </TouchableOpacity>
        </View>\\n\

code = code.replace('{/* Header Section */}', headerBlock + '        {/* Header Section */}');

let modalsBlock = \
      {/* Perfil Modal */}
      <Modal visible={profileModal} animationType="slide" transparent={true} onRequestClose={() => setProfileModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: designColors.surfaceContainerLowest, padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
            <ThemedText style={{ fontSize: 20, fontWeight: 'bold', color: designColors.primary, marginBottom: 16 }}>Tu Perfil</ThemedText>
            <TouchableOpacity onPress={pickProfileImage} style={{ alignItems: 'center', marginBottom: 16 }}>
              {editFoto ? <Image source={{uri: editFoto}} style={{width: 80, height: 80, borderRadius: 40}} /> : <View style={{width: 80, height: 80, borderRadius: 40, backgroundColor: designColors.surfaceContainerHighest, justifyContent: 'center', alignItems: 'center'}}><ThemedText>Toca para foto</ThemedText></View>}
            </TouchableOpacity>
            
            <ThemedText style={{ fontSize: 14, fontWeight: '600', color: designColors.onSurface, marginTop: 8 }}>Nombre</ThemedText>
            <TextInput style={{ borderWidth: 1, borderColor: designColors.outlineVariant, borderRadius: 8, padding: 12, marginTop: 4, marginBottom: 8 }} value={editNombre} onChangeText={setEditNombre} placeholder="Tu nombre..." />
            
            <ThemedText style={{ fontSize: 14, fontWeight: '600', color: designColors.onSurface, marginTop: 8 }}>Bio / Descripción</ThemedText>
            <TextInput style={{ borderWidth: 1, borderColor: designColors.outlineVariant, borderRadius: 8, padding: 12, marginTop: 4, height: 60, marginBottom: 8 }} value={editDesc} onChangeText={setEditDesc} placeholder="Un poco sobre ti..." multiline />
            
            <ThemedText style={{ fontSize: 14, fontWeight: '600', color: designColors.onSurface, marginTop: 8 }}>Gustos literarios</ThemedText>
            <TextInput style={{ borderWidth: 1, borderColor: designColors.outlineVariant, borderRadius: 8, padding: 12, marginTop: 4, marginBottom: 16 }} value={editGustos} onChangeText={setEditGustos} placeholder="Ej. Ficción, Ciencia Ficción..." />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
              <TouchableOpacity style={{ padding: 12 }} onPress={() => setProfileModal(false)}><ThemedText style={{ color: designColors.outline, fontWeight: '600' }}>Cancelar</ThemedText></TouchableOpacity>
              <TouchableOpacity style={{ padding: 12, backgroundColor: designColors.primary, borderRadius: 8 }} onPress={saveProfile}><ThemedText style={{ color: '#fff', fontWeight: '600' }}>Guardar</ThemedText></TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Share Modal */}
      <Modal visible={shareModal} animationType="fade" transparent={true} onRequestClose={() => setShareModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: designColors.surfaceContainerLowest, padding: 24, borderRadius: 16 }}>
            <ThemedText style={{ fontSize: 20, fontWeight: 'bold', color: designColors.primary, marginBottom: 16 }}>Compartir en...</ThemedText>
            <TouchableOpacity style={{ padding: 12, backgroundColor: '#25D366', borderRadius: 8, marginTop: 8 }} onPress={() => { Linking.openURL('whatsapp://send?text=¡Mira este libro que estoy leyendo! ' + bookToShare?.titulo); setShareModal(false); }}>
               <ThemedText style={{color: 'white', textAlign: 'center', fontWeight: 'bold'}}>WhatsApp</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 12, backgroundColor: '#1877F2', borderRadius: 8, marginTop: 8 }} onPress={() => { Linking.openURL('https://www.facebook.com/sharer/sharer.php?u=https://expo.dev&quote=' + bookToShare?.titulo); setShareModal(false); }}>
               <ThemedText style={{color: 'white', textAlign: 'center', fontWeight: 'bold'}}>Facebook</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 12, borderRadius: 8, marginTop: 8, borderWidth: 1, borderColor: '#ccc' }} onPress={() => setShareModal(false)}>
               <ThemedText style={{textAlign: 'center', color: '#555'}}>Cancelar</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>\

code = code.replace('</ThemedView>', modalsBlock + '\\n    </ThemedView>');

fs.writeFileSync('c:/Proyectos/libros/app/(tabs)/index.tsx', code);
