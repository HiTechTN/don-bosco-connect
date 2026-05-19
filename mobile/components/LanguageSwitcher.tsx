import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import i18n from './i18n';

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'ar', label: 'العربية', flag: '🇹🇳' }
];

export function LanguageSwitcher() {
  const [modalVisible, setModalVisible] = useState(false);
  const currentLang = languages.find(l => l.code === i18n.locale) || languages[1];

  const changeLanguage = (code: string) => {
    i18n.locale = code;
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>{currentLang.flag}</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Language /Langue / اللغة</Text>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.langOption,
                  i18n.locale === lang.code && styles.langOptionActive
                ]}
                onPress={() => changeLanguage(lang.code)}
              >
                <Text style={styles.langFlag}>{lang.flag}</Text>
                <Text style={styles.langLabel}>{lang.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
  buttonText: {
    fontSize: 24,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 24,
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#2a2a3e',
  },
  langOptionActive: {
    backgroundColor: '#3b82f6',
  },
  langFlag: {
    fontSize: 24,
    marginRight: 16,
  },
  langLabel: {
    fontSize: 18,
    color: 'white',
  },
  closeButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  closeText: {
    color: '#94a3b8',
    fontSize: 16,
  },
});