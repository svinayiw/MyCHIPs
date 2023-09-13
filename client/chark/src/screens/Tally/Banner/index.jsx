import React from 'react';
import { View, StyleSheet, Text, Image, Dimensions } from 'react-native';

import { colors } from '../../../config/constants';
import useProfile from '../../../hooks/useProfile';
import useMessageText from '../../../hooks/useMessageText';

import Header from '../Header';
import Avatar from '../../../components/Avatar';
import { AddIcon, ChitIcon, ProfileImage, VisualIcon } from '../../../components/SvgAssets/SvgAssets';

const Banner = (props) => {
  const { avatar, personal } = useProfile();
  const { messageText } = useMessageText();
  const userTallyText = messageText?.userTallies ?? {};

  const navigateToReport = () => {
    props.navigation?.navigate?.('TallyReport')
  }

  const isNetNegative = props.totalNet < 0;

  return (
    <View style={styles.container}>
      <Header
        icon={<VisualIcon />}
        title={userTallyText?.tallies?.title ?? ''}
        onClick={navigateToReport}
      />

      <View style={{ alignItems: 'center' }}>
        <View style={styles.balanceContainer}>
          <View style={styles.balance}>
            <View style={styles.avatarWrapper}>
            <Avatar avatar={avatar} />
            <Text style={styles.name}>{personal?.cas_name ?? ''}</Text>
            </View>

            <View style={styles.textWrapper}>
              <Text>Net CHIP balance</Text>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {/* <Image source={isNetNegative ? mychipsNeg : mychips} /> */}
                <ChitIcon color={isNetNegative ? colors.red : colors.green} />
                <Text style={isNetNegative ? styles.mychipsNetNeg : styles.mychipsNet}>
                  {props.totalNet}
                </Text>
              </View>

              {
                !!props.currencyCode && <Text>{props.totalNetDollar} {props.currencyCode}</Text>
              }
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

const mychipsNet = {
  marginLeft: 5,
  fontSize: 32,
  fontWeight: '500',
  color: colors.green,
  maxWidth:Dimensions.get("window").width*0.5,
}

const styles = StyleSheet.create({
  container: {
    height: 265,
    backgroundColor: colors.gray700,
  },
  balanceContainer: {
    padding: 16,
    maxHeight:200,
    maxWidth: '90%',
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: 'rgba(206, 204, 204, 0.75)',
  },
  balance: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'space-between'
  },
  mychipsNet,
  mychipsNetNeg: {
    ...mychipsNet,
    color: colors.red,
  },
  name:{paddingTop:10},
  avatarWrapper:{paddingRight: 10},
  textWrapper: { alignItems: 'center', marginLeft: 5}
});


export default Banner;
