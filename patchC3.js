const fs = require('fs');

const code = \import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View, ImageBackground } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { BooksService } from '@/services/books';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function CreateBookScreen() {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const router = useRouter();

  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [paginas, setPaginas] = useState('');
  const [categoria, setCategoria] = useState('');
  const [resena, setResena] = useState('');
  const [loading, setLoading] = useState(false);
  const [portada, setPortada] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const placeHolderImageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuCgEarWhyKWrVNWiJVvB_8X9lwd1iVEKN2-GgsnIyRY88WMiJnYSmDyLLu_luehKaKepJZw_kum9JVKcMaXoLmpUsUapdQq5SWtN46Mf4qBmnYuDmLaY6-WlwMF8qbZaCKhYAIDi3-9Mc7TXCCYWs-Cv5HsNJ6Hy4oHAGx-re_Px0AEctpmoVdqx3EHQoRJv6wpE15lwQ82wAxXaHtKjFEIEfRljARw0Mgb9zabvjQjILRtrU-MbPDHsa53P2gtR8CRTr_EY0o3TC1N";

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setPortada('data:image/jpeg;base64,' + result.assets[0].base64);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (result.canceled === false && result.assets && result.assets.length > 0) {
        setPdfUrl(result.assets[0].uri);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async () => {
    if (!titulo || !paginas) {
      Alert.alert('Campos incompletos', 'Por favor llena el título y la cantidad de páginas.');
      return;
    }

    const numPaginas = parseInt(paginas);
    if (isNaN(numPaginas)) {
      Alert.alert('Error', 'La cantidad de páginas debe ser un número.');
      return;
    }

    try {
      setLoading(true);
      await BooksService.createBook({
        titulo,
        autor: autor || 'Anónimo',
        paginas: numPaginas,
        categoria: categoria || undefined,
        resena: resena || undefined,
        portada_url: portada,
        pdf_url: pdfUrl,
        estado: 'pendiente'
      });
      
      if (Platform.OS === 'web') window.alert('Éxito: ¡El libro se guardo correctamente!');
      else Alert.alert('Éxito', '¡El libro se guardo correctamente en la biblioteca!');
      
      setTitulo('');
      setAutor('');
      setPaginas('');
      setCategoria('');
      setResena('');
      setPortada(null);
      setPdfUrl(null);
      router.replace('/(tabs)');

    } catch (err: any) {
      if (err.message && err.message.includes('anteriormente')) {
         if (Platform.OS === 'web') window.alert('Error: El libro ya fue ingresado anteriormente.');
         else Alert.alert('Error', 'El libro ya fue ingresado anteriormente.');
      } else {
         if (Platform.OS === 'web') window.alert('Hubo un problema: ' + err.message);
         else Alert.alert('Hubo un problema', err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* Header Sticky */}
      <View style={[styles.navHeader, { backgroundColor: 'rgba(246, 250, 253, 0.8)' }]}>
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => router.back()}>
          <IconSymbol name="arrow.left" size={20} color={colors.primary} />
          <ThemedText style={{ marginLeft: 6, fontWeight: '600', color: colors.primary, fontSize: 14 }}>Regresar</ThemedText>
        </TouchableOpacity>
        <ThemedText style={{ fontSize: 18, fontWeight: '800', color: colors.primary }}>Nuevo Archivo</ThemedText>
        <View style={{ width: 60 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          
          <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
            <View style={{ marginBottom: 32 }}>
              <ThemedText style={{ fontSize: 36, fontWeight: '800', color: colors.onSurface, lineHeight: 40 }}>
                Expandir la
              </ThemedText>
              <ThemedText style={{ fontSize: 36, fontWeight: '800', color: colors.primaryContainer, lineHeight: 40 }}>
                Colección Privada.
              </ThemedText>
              <ThemedText style={{ fontSize: 16, color: colors.onSurfaceVariant, marginTop: 12, lineHeight: 24 }}>
                Registra una nueva obra en tu galería intelectual. Cada detalle es una pieza del archivo.
              </ThemedText>
            </View>

            {/* Portada Upload Box - con fondo de imagen y opacidad 10% */}
            <TouchableOpacity activeOpacity={0.8} style={styles.portadaContainer} onPress={pickImage}>
              <View style={[styles.portadaBox, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant }]}>
                 {portada ? (
                    <Image source={{ uri: portada }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                 ) : (
                    <>
                      <Image source={{ uri: placeHolderImageUrl }} style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.1 }} resizeMode="cover" />
                      <IconSymbol name="photo" size={40} color={colors.outlineVariant} />
                      <ThemedText style={{ marginTop: 8, fontSize: 12, fontWeight: '700', color: colors.outline, letterSpacing: 1, textTransform: 'uppercase' }}>
                        Portada
                      </ThemedText>
                    </>
                 )}
              </View>
            </TouchableOpacity>

            {/* Título */}
            <View style={styles.inputWrap}>
              <ThemedText style={[styles.label, { color: colors.primary }]}>TÍTULO DE LA OBRA <ThemedText style={{color: 'red'}}>*</ThemedText></ThemedText>
              <TextInput style={styles.textInput} placeholder="Ej: El Aleph" placeholderTextColor="#bdc8ce" value={titulo} onChangeText={setTitulo} />
            </View>

            {/* Autor */}
            <View style={styles.inputWrap}>
              <ThemedText style={[styles.label, { color: colors.primary }]}>AUTOR (OPCIONAL)</ThemedText>
              <TextInput style={styles.textInput} placeholder="Jorge Luis Borges" placeholderTextColor="#bdc8ce" value={autor} onChangeText={setAutor} />
            </View>

            {/* Categoría */}
            <View style={styles.inputWrap}>
              <ThemedText style={[styles.label, { color: colors.primary }]}>CATEGORÍA</ThemedText>
              <TextInput style={styles.textInput} placeholder="Filosofía" placeholderTextColor="#bdc8ce" value={categoria} onChangeText={setCategoria} />
            </View>

            {/* Hojas */}
            <View style={styles.inputWrap}>
              <ThemedText style={[styles.label, { color: colors.primary }]}>NÚMERO DE HOJAS</ThemedText>
              <TextInput style={styles.textInput} placeholder="Ej: 350" placeholderTextColor="#bdc8ce" value={paginas} onChangeText={setPaginas} keyboardType="numeric" />
            </View>

            {/* Reseña */}
            <View style={styles.inputWrap}>
              <ThemedText style={[styles.label, { color: colors.primary }]}>RESEÑA O NOTAS DE ARCHIVO</ThemedText>
              <TextInput style={[styles.textInput, { height: 100, textAlignVertical: 'top' }]} placeholder="Describe el impacto de esta obra o un resumen breve..." placeholderTextColor="#bdc8ce" value={resena} onChangeText={setResena} multiline />
            </View>

            {/* Documento PDF */}
            <View style={[styles.inputWrap, { marginTop: 16 }]}>
              <ThemedText style={[styles.label, { color: colors.primary }]}>DOCUMENTO PDF (APUNTES/LIBRO)</ThemedText>
              <TouchableOpacity activeOpacity={0.7} style={styles.pdfArea} onPress={pickDocument}>
                 <View style={{ backgroundColor: 'rgba(0, 103, 129, 0.05)', flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, borderRadius: 16 }}>
                    <IconSymbol name="arrow.up.doc.fill" size={40} color={colors.primary} />
                    <ThemedText style={{ fontSize: 14, fontWeight: '600', color: colors.onSurface, marginTop: 12 }}>
                      {pdfUrl ? 'PDF Seleccionado' : 'Subir PDF'}
                    </ThemedText>
                    <ThemedText style={{ fontSize: 12, color: colors.outlineVariant, textAlign: 'center', marginTop: 4 }}>
                      {pdfUrl ? 'Toca para cambiar' : 'Haz clic o arrastra un archivo PDF aquí.\\nIdeal para apuntes universitarios.'}
                    </ThemedText>
                 </View>
              </TouchableOpacity>
            </View>

            {/* Guardar */}
            <View style={{ marginTop: 32, marginBottom: 24 }}>
              {loading ? (
                 <ActivityIndicator size="large" color="#fc9300" />
              ) : (
                 <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
                    <IconSymbol name="book.fill" size={24} color="#623600" />
                    <ThemedText style={styles.saveBtnText}>Guardar Libro</ThemedText>
                 </TouchableOpacity>
              )}
              <ThemedText style={{ marginTop: 16, textAlign: 'center', fontSize: 10, color: colors.outline, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' }}>
                AL GUARDAR, EL LIBRO SE SINCRONIZARÁ CON TU ESTANTE DIGITAL.
              </ThemedText>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: 'transparent',
  },
  portadaContainer: { alignItems: 'center', marginBottom: 32 },
  portadaBox: {
    width: 200,
    aspectRatio: 3/4,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  inputWrap: { marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', paddingLeft: 4, marginBottom: 6 },
  textInput: {
    backgroundColor: '#dfe3e6',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#171c1f',
  },
  pdfArea: {
    height: 160,
    borderWidth: 2,
    borderColor: 'rgba(0, 103, 129, 0.4)',
    borderStyle: 'dashed',
    borderRadius: 16,
  },
  saveBtn: {
    backgroundColor: '#fc9300', // orange color 
    paddingVertical: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fc9300',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  saveBtnText: {
    color: '#623600',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
  },
});
\;
fs.writeFileSync('c:/Proyectos/libros/app/(tabs)/create.tsx', code);
