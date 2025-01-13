import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import McIcon from 'react-native-vector-icons/MaterialCommunityIcons';

type ButtonProps = {
    title: string;
    onPress: () => void;
    mode: 'calories' | 'weight';
};

type KeyboardProps = {
    onSubmit?: (value: string) => void;
    onValueChange?: (value: string) => void;
    mode: 'calories' | 'weight';
};

const Button: React.FC<ButtonProps> = ({ title, onPress, mode }) => (
    <TouchableOpacity
        style={[
            styles.button,
            {
                backgroundColor: ['back', 'plusminus'].includes(title) ? 
                (mode === 'calories' ?  '#8F98FF' : '#FF7648') : '#4DC591',
            },
        ]}
        onPress={onPress}
    >
        {title === 'back' ? (
            <Icon name="arrow-back" size={30} color="white" />
        ) : title === 'plusminus' ? (
            <McIcon name="plus-minus" size={30} color="white" />
        ) : (
            <Text style={styles.buttonText}>{title}</Text>
        )}
    </TouchableOpacity>
);

const WideButton: React.FC<ButtonProps> = ({ onPress, mode }) => (
    <TouchableOpacity
        style={[
            styles.wideButton,
            {
                backgroundColor: mode === 'calories' ? '#8F98FF' : '#FF7648',
            },
        ]}
        onPress={onPress}
    >
        <Icon name="checkmark" size={30} color="white" />
    </TouchableOpacity>
);

export const Keyboard: React.FC<KeyboardProps> = ({ onSubmit, onValueChange, mode }) => {
    const [value, setValue] = React.useState('');
    const [isNegative, setIsNegative] = React.useState(false);

    const handleButtonPress = (key: string) => {
        if (key === 'back') {
            setValue((prev) => prev.slice(0, -1));
        } else if (key === 'submit') {
            const valueToSubmit = value || '0';
            const finalValue = isNegative && valueToSubmit !== '0' ? `-${valueToSubmit}` : valueToSubmit;
            onSubmit?.(finalValue);
            setValue('');
            setIsNegative(false);
        } else if (key === 'plusminus') {
            if (!value) {
                return;
            }

            setIsNegative((prev) => !prev);
        } else {
            setValue((prev) => {
                if (key === '0' && !prev) {
                    return '';
                }
                
                if ((prev+key).length > 4) {
                    return prev;
                }

                return prev + key;
            });
        }
    };

    React.useEffect(() => {
        if (value === '0' || value === '' || value === '-0') {
            setIsNegative(false);
        }
    }, [value]);

    const finalValue = isNegative && value ? `-${value}` : value;
    React.useEffect(() => {
        onValueChange?.(finalValue);
    }, [finalValue]);

    const rows = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        ['back', 0, 'plusminus'],
    ];

    return (
        <View style={styles.container}>
            {rows.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.row}>
                    {row.map((button) => (
                        <Button
                            key={button.toString()}
                            title={button.toString()}
                            onPress={() => handleButtonPress(button.toString())}
                            mode={mode}
                        />
                    ))}
                </View>
            ))}
            <WideButton mode={mode} title="submit" onPress={() => handleButtonPress('submit')} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        maxWidth: 400,
    },
    button: {
        marginRight: 2,
        marginBottom: 2,
        flex: 1,
        height: 60,
        backgroundColor: '#4DC591',
        justifyContent: 'center',
        alignItems: 'center',
    },
    wideButton: {
        marginRight: 2,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 30,
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        width: '100%',
    },
});
