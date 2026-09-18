import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert, StyleSheet } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [carregando, setCarregando] = useState(false);

    const handleLogin = async () => {
        if (!email || !senha) {
            Alert.alert('Atenção', 'Por favor, preencha e-mail e senha.');
            return;
        }
        
        setCarregando(true);
        try {
            await signInWithEmailAndPassword(auth, email.trim(), senha);
            Alert.alert('Sucesso', 'Login realizado com sucesso!');
        } catch (error) {
            console.log('Erro de autenticação:', error.message);
            Alert.alert('Erro', 'E-mail ou senha inválidos.');
        } finally {
            setCarregando(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Acesso ao Sistema</Text>

            <TextInput  
                placeholder="E-mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
            />

            <TextInput
                placeholder="Senha"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
                style={styles.input}
            />

            <Button 
                title={carregando ? "Entrando..." : "Entrar"}
                onPress={handleLogin}
                disabled={carregando}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff'
    },
    titulo: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        color: '#000',
        backgroundColor: '#fff'
    }
});
 