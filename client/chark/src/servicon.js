import React, {useState} from 'react';
import {View, StyleSheet, TouchableWithoutFeedback} from 'react-native';

import useSocket from './hooks/useSocket';

import {colors} from './config/constants';
import TokenDebug from './components/TokenDebug';
import CenteredModal from './components/CenteredModal';

const ServIcon = () => {
  const ServerStatus = {
    connected: 'Connected',
    connecting: 'Connecting',
    disconnected: 'Disconnected',
  };

  const {status} = useSocket();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const onCancel = () => {
    setIsModalVisible(false);
  };

  const ServerStatusCircle = props => {
    return <View style={styles.circle(props.color)} />;
  };

  const getStatusIcon = () => {
    switch (status) {
      case ServerStatus.connected:
        return <ServerStatusCircle color={colors.connected} />;

      case ServerStatus.connecting:
        return <ServerStatusCircle color={colors.connecting} />;

      case ServerStatus.disconnected:
        return <ServerStatusCircle color={colors.disconnected} />;

      default:
        return <ServerStatusCircle color={colors.connecting} />;
    }
  };

  return (
    <>
      <View style={{ backgroundColor: colors.white }}>
        <TouchableWithoutFeedback
          testID="serverIcon"
          onPress={() => setIsModalVisible(true)}>
          <View style={styles.wrapper} testID="appStatus">
            {getStatusIcon()}
          </View>
        </TouchableWithoutFeedback>
      </View>

      <CenteredModal isVisible={isModalVisible} onClose={onCancel}>
        <TokenDebug onCancel={onCancel} />
      </CenteredModal>
    </>
  );
};

const styles = StyleSheet.create({
  circle: color => ({
    width: 10,
    height: 10,
    borderRadius: 8,
    borderColor: color,
    backgroundColor: color,
  }),
  wrapper: {
    padding: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});

export default ServIcon;
