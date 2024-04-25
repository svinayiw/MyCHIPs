import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from 'react-redux';
import {
  StyleSheet,
  ScrollView,
  View,
  TextInput,
  ActivityIndicator,
  Text,
  Alert,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { useSelector } from "react-redux";
import { v5 as uuidv5 } from 'uuid';
import stringify from 'json-stable-stringify';
import moment from 'moment';
import { Toast } from "react-native-toast-message/lib/src/Toast";

import { colors, toastVisibilityTime } from "../../../config/constants";
import Button from "../../../components/Button";
import { getCurrency } from "../../../services/user";
import useSocket from "../../../hooks/useSocket";
import { round } from "../../../utils/common";
import { insertChit } from "../../../services/tally";
import { useChitsMeText } from "../../../hooks/useLanguage";
import useMessageText from "../../../hooks/useMessageText";
import useTitle from '../../../hooks/useTitle';
import { showError } from '../../../utils/error';
import { createLiftsPay } from '../../../services/pay'

import { createSignature } from "../../../utils/message-signature";
import { setShowCreateSignatureModal } from '../../../redux/profileSlice';
import { KeyNotFoundError } from '../../../utils/Errors';

import { ChitIcon, SwapIcon } from "../../../components/SvgAssets/SvgAssets";
import BottomSheetModal from "../../../components/BottomSheetModal";
import SuccessModal from "../Success";
import { promptBiometrics } from "../../../services/biometrics";

const PaymentDetail = (props) => {
  const { chit_ent, tally_uuid, chit_seq, tally_type, chad, distributedPayment } = props.route?.params;
  const { wm } = useSocket();
  const { preferredCurrency } = useSelector((state) => state.profile);
  const [conversionRate, setConversionRate] = useState(undefined);
  const currencyCode = preferredCurrency.code;
  const dispatch = useDispatch();

  const [memo, setMemo] = useState();
  const [reference, setReference] = useState({});
  const [chit, setChit] = useState();
  const [inputWidth, setInputWidth] = useState(80);

  const [usd, setUSD] = useState();

  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const [isSwitched, setIsSwitched] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);

  const ref = useRef("");

  const chitsText = useChitsMeText(wm);
  const { messageText } = useMessageText();

  const talliesMeMessageText = messageText?.tallies_v_me?.msg;

  const showCreateSignatureModal = () => {
    dispatch(setShowCreateSignatureModal(true));
  }

  useTitle(props.navigation, chitsText?.msg?.dirpmt?.title)

  useEffect(() => {
    if(distributedPayment) {
      setChit(distributedPayment.units ?? 0)
      setMemo(distributedPayment.memo ?? 0)
      totalNetDollar(distributedPayment.units ?? 0)
      const textLength = distributedPayment?.units?.length;
      setInputWidth(Math.max(Math.ceil(textLength * 20), 80))
    }
  }, [distributedPayment])

  useEffect(() => {
    if(distributedPayment?.units) {
      totalNetDollar(distributedPayment.units ?? 0)
    }
  }, [distributedPayment?.units, conversionRate])

  useEffect(() => {
    if (currencyCode) {
      setLoading(true);
      getCurrency(wm, currencyCode)
        .then((data) => {
          setConversionRate(parseFloat(data?.rate ?? 0));
        })
        .catch((err) => {
          console.log("EXCEPTION ==> ", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [currencyCode]);

  const totalNetDollar = (text) => {
    const convertedChit = parseInt(text);
    if (conversionRate && convertedChit) {
      const total = convertedChit * conversionRate;
      const totalValue = round(total, 2);

      return setUSD(totalValue);
    }

    setUSD(0);
  };

  const totalChit = (text) => {
    const convertedUSD = parseInt(text);
    if (conversionRate && convertedUSD) {
      const total = convertedUSD / conversionRate;
      const totalValue = round(total, 2);

      return setChit(totalValue);
    }

    setChit(0);
  };

  const onDistributedPayment = async () => {
    Keyboard.dismiss();
    setDisabled(true);

    try {
      const pay = await createLiftsPay(wm, {
        ...distributedPayment,
        units: chit,
        memo: memo,
      });

      setShowSuccess(true);
    } catch(err) {
      showError(err)
    } finally {
      setDisabled(false);
    }
  }

  const onMakePayment = async () => {
    Keyboard.dismiss();
    const net = round((chit ?? 0) * 1000, 0);

    if (net < 0) {
      return Toast.show({
        type: 'error',
        text1: "Can't input negative chit.",
        visibilityTime: toastVisibilityTime,
      });
    }

    if (net == 0) {
      return Toast.show({
        type: 'error',
        text1: 'Please provide an amount',
        visibilityTime: toastVisibilityTime,
      });
    }

    setDisabled(true);
    const _chad = `chip://${chad.cid}:${chad.agent}`
    const date = moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ')
    const uuid = uuidv5(date + Math.random(), uuidv5(_chad, uuidv5.URL));
    const referenceJson = JSON.stringify({});

    const chitJson = {
      uuid,
      date,
      memo,
      units: net,
      by: tally_type,
      type: "tran",
      tally: tally_uuid,
      ref: reference,
    }

    try {
      const json = stringify(chitJson);

      await promptBiometrics("Use biometrics to create a signature")
      const signature = await createSignature(json)

      const payload = {
        chit_ent,
        chit_seq,
        memo,
        chit_date: date,
        signature,
        units: net,
        request: "good",
        issuer: tally_type,
        reference: referenceJson,
      };

      await insertChit(wm, payload)
      setShowSuccess(true);
    } catch(err) {
      if (err instanceof KeyNotFoundError) {
        showCreateSignatureModal();
      } else {
        showError(err);
      }
    } finally {
      setDisabled(false);
    }
  };

  const onPay = () => {
    if(distributedPayment) {
      onDistributedPayment()
    } else {
      onMakePayment()
    }
  }

  /**
    * @param {string} type - chit or usd
    */
  const onAmountChange = (type) => {
    /**
      * @param {string} text - amount
      */
    return (text) => {
      const regex = /(\..*){2,}/;
      if(regex.test(text)) {
        return;
      }

      const textLength = text.length;
      setInputWidth(Math.max(Math.ceil(textLength * 20), 80))

      if(type === 'chit') {
        setChit(text);
        totalNetDollar(text);
      } else if(type === 'usd') {
        setUSD(text);
        totalChit(text);
      }
    }
  }

  const checkChipDecimalPlace = () => {
    let newValue = '';
    if(chit) {
      const [precision, decimalPlace] = chit.split('.');
      if(decimalPlace) {
        const decimalLength = decimalPlace.length;
        const remainingLength = Math.max(3 - decimalLength, 0);
        newValue = chit + Array(remainingLength).fill('0').join('');
        setChit(newValue)
      } else {
        newValue = precision + '.000'
        setChit(newValue);
      }
    }

    if(newValue) {
      setInputWidth(Math.max(Math.ceil(newValue.length * 20), 80))
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size={"large"} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.centerWrapper}>
        {isSwitched ? (
          <>
            <View style={styles.row}>
              <Text style={styles.text}>USD</Text>
              <TextInput
                maxLength={8}
                style={[styles.amount, { width: inputWidth }]}
                placeholder="0.00"
                keyboardType="numeric"
                value={usd}
                onChangeText={onAmountChange('usd')}
                onBlur={checkChipDecimalPlace}
              />
            </View>

            {currencyCode && chit ? (
        <View style={[styles.row,{alignSelf:'flex-end',marginRight:20}]}>
                <ChitIcon color={colors.black} height={18} width={12} />
                <Text style={[styles.text,{marginLeft:10}]}>{chit}</Text>
              </View>
            ) : (
              <></>
            )}
          </>
        ) : (
          <>
            <View style={styles.row}>
              <ChitIcon color={colors.black} height={18} width={12} />
              <TextInput
                maxLength={8}
                style={[styles.amount, { width: inputWidth }]}
                placeholder="0.00"
                keyboardType="numeric"
                value={chit}
                onChangeText={onAmountChange('chit')}
                onBlur={checkChipDecimalPlace}
              />
            </View>

            {currencyCode && usd ? (
            <View style={[styles.row,{alignSelf:'flex-end',marginRight:20}]}>
                <Text style={styles.text}>
                  {usd} {currencyCode}
                </Text>
              </View>
            ) : (
              <></>
            )}
          </>
        )}
      </View>

      {currencyCode ? (
        <TouchableOpacity
          style={styles.icon}
          onPress={() => setIsSwitched(!isSwitched)}
        >
          <SwapIcon />
        </TouchableOpacity>
      ) : (
        <></>
      )}

      <TouchableOpacity
        style={styles.input}
        onPress={() => ref.current.focus()}
      >
        <TextInput
          ref={ref}
          placeholder={chitsText?.col?.memo?.title ?? ''}
          value={memo}
          onChangeText={setMemo}
        />
      </TouchableOpacity>

      <View style={styles.buttonView}>
        <Button
          style={styles.button}
          title={talliesMeMessageText?.['launch.pay']?.title ?? ''}
          onPress={onPay}
          disabled={disabled}
        />
      </View>

      <BottomSheetModal
        isVisible={showSuccess}
        onClose={() => setShowSuccess(false)}
      >
        <SuccessModal
          onClose={() => {
            props.navigation.goBack();

            setShowSuccess(false);
          }}
        />
      </BottomSheetModal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: colors.white,
  },
  amount: {
    paddingLeft: 10,
    fontSize: 26,
    paddingVertical: 20,
    fontWeight: "500",
    fontFamily: "inter",
    color: colors.black,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
  },
  input: {
    height: 100,
    padding: 10,
    borderRadius: 4,
    marginBottom: 16,
    borderWidth: 0.2,
    borderColor: colors.gray300,
  },
  headerText: {
    color: colors.black,
    fontSize: 14,
  },
  button: {
    height: 45,
    width: "100%",
    borderRadius: 40,
    marginBottom: 20,
    borderColor: "blue",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "blue",
  },
  centerWrapper: {
    marginBottom: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  row: {
    width:200,
    paddingRight:20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:'center'
  },
  text: {
    fontWeight: "500",
    color: colors.gray300,
  },
  icon: {
    position: "absolute",
    right: 60,
    top: 40,
  },
});

export default PaymentDetail;
