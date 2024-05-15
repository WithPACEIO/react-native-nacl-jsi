import React from 'react';

import { SafeAreaView, ScrollView, StyleSheet, View, Text } from 'react-native';
import {
  secretboxGenerateKey,
  secretboxSeal,
  secretboxOpen,
  boxGenerateKey,
  boxSeal,
  boxOpen,
  aesGenerateKey,
  aesEncrypt,
  aesDecrypt,
  argon2idHash,
  argon2idVerify,
  argon2idDeriveKey,
  ARGON2ID_OPSLIMIT_SENSITIVE,
  ARGON2ID_MEMLIMIT_INTERACTIVE,
  ARGON2ID_SALTBYTES,
  getRandomBytes,
  signGenerateKey,
  signDetached,
  signVerifyDetached,
  type AesResult,
} from 'react-native-nacl-jsi';

export default function App() {
  const aesKey = aesGenerateKey();
  const { encrypted: aesEncryptedMessage, iv } = aesEncrypt(
    'hello aes!',
    aesKey
  ) as AesResult;
  const aesDecryptedMessage = aesDecrypt(aesEncryptedMessage, aesKey, iv);

  const secretKey = secretboxGenerateKey();
  const encryptedMessage = secretboxSeal('hello with secretbox!', secretKey);
  const decryptedMessage = secretboxOpen(encryptedMessage, secretKey);

  const recipientKeyPair = boxGenerateKey();
  const senderKeyPair = boxGenerateKey();
  const boxEncryptedMessage = boxSeal(
    'hello with box!',
    recipientKeyPair.publicKey,
    senderKeyPair.secretKey
  );
  const boxDecryptedMessage = boxOpen(
    boxEncryptedMessage,
    senderKeyPair.publicKey,
    recipientKeyPair.secretKey
  );

  const password = 'secure_password1234)';
  const hashedPassword = argon2idHash(
    password,
    ARGON2ID_OPSLIMIT_SENSITIVE,
    ARGON2ID_MEMLIMIT_INTERACTIVE
  );
  const isVerified = argon2idVerify(hashedPassword, password);

  const salt = getRandomBytes(ARGON2ID_SALTBYTES);
  const derivedKey = argon2idDeriveKey(
    password,
    salt,
    32,
    ARGON2ID_OPSLIMIT_SENSITIVE,
    ARGON2ID_MEMLIMIT_INTERACTIVE
  );

  const signKeyPair = signGenerateKey();
  const messageToSign = 'sign this message';
  const signature = signDetached(messageToSign, signKeyPair.secretKey);
  const isSignatureVerified = signVerifyDetached(
    messageToSign,
    signKeyPair.publicKey,
    signature as string
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.algorithmContainer}>
          <Text style={styles.algorithmName}>AES256-GCM</Text>
          <Text>Key: {aesKey}</Text>
          <Text>---</Text>
          <Text>cipher text: {aesEncryptedMessage}</Text>
          <Text>---</Text>
          <Text>clear text: {aesDecryptedMessage}</Text>
        </View>
        <View style={styles.algorithmContainer}>
          <Text style={styles.algorithmName}>SECRET BOX</Text>
          <Text>secret key: {secretKey}</Text>
          <Text>---</Text>
          <Text>nonce + cipher text: {encryptedMessage}</Text>
          <Text>---</Text>
          <Text>clear text: {decryptedMessage}</Text>
        </View>
        <View style={styles.algorithmContainer}>
          <Text style={styles.algorithmName}>BOX</Text>
          <Text>nonce + cipher text: {boxEncryptedMessage}</Text>
          <Text>---</Text>
          <Text>clear text: {boxDecryptedMessage}</Text>
        </View>
        <View style={styles.algorithmContainer}>
          <Text style={styles.algorithmName}>Argon2id</Text>
          <Text>Password: {password}</Text>
          <Text>---</Text>
          <Text>Hash: {hashedPassword}</Text>
          <Text>---</Text>
          <Text>Is verified: {isVerified ? 'true' : 'false'}</Text>
        </View>
        <View style={styles.algorithmContainer}>
          <Text style={styles.algorithmName}>Argon2id key derivation</Text>
          <Text>Key: {password}</Text>
          <Text>Salt: {salt}</Text>
          <Text>---</Text>
          <Text>{derivedKey}</Text>
        </View>
        <View style={styles.algorithmContainer}>
          <Text style={styles.algorithmName}>Signature</Text>
          <Text>Public key: {signKeyPair.publicKey}</Text>
          <Text>Secret key: {signKeyPair.secretKey}</Text>
          <Text>Signature: {signature}</Text>
          <Text>Is verified: {isSignatureVerified ? 'true' : 'false'}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
  },
  algorithmContainer: {
    width: '100%',
    paddingBottom: 20,
    borderBottomColor: 'black',
    backgroundColor: '#eee',
    marginBottom: 10,
    padding: 10,
  },
  algorithmName: {
    alignSelf: 'center',
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
