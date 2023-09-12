import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import moment from 'moment'

import HelpText from '../../../components/HelpText';
import CustomButton from '../../../components/Button';

import EyeIcon from '../../../../assets/svg/eye-icon.svg';
import { colors } from '../../../config/constants';
import useMessageText from '../../../hooks/useMessageText';
import { formatDate } from '../../../utils/format-date';

const TallyEditView = (props) => {
  const tally = props.tally;
  const tallyType = props.tallyType;
  const contract = props.contract;
  const holdTerms = props.holdTerms;
  const partTerms = props.partTerms;
  const comment = props.comment;
  const setComment = props.setComment;
  const onHoldTermsChange = props.onHoldTermsChange;
  const onPartTermsChange = props.onPartTermsChange;
  const setTallyType = props.setTallyType;
  const setContract = props.setContract;
  const tallyContracts = props.tallyContracts ?? [];

  const { messageText } = useMessageText();
  const talliesText = messageText?.tallies;
  const holdTermsText = messageText?.terms_lang?.hold_terms?.values;
  const partTermsText = messageText?.terms_lang?.part_terms?.values;
  const hasPartCert = !!tally?.part_cert;

  return (
    <View>
      <View style={styles.detailControl}>
        <View style={styles.contractLabel}>
          <HelpText
            label={talliesText?.contract?.title ?? ''}
            helpText={talliesText?.contract?.help}
          />

        <TouchableWithoutFeedback
          onPress={props.onViewContract}
          style={{ marginBottom: 8 }}
        >
          <EyeIcon style={{ marginLeft: 8, marginBottom: 8 }}/>
        </TouchableWithoutFeedback>

        </View>

        <Picker
          mode="dropdown"
          selectedValue={contract}
          onValueChange={(item) => {
            setContract(item)
          }}
        >
          <Picker.Item label="Select contract" />
          {
            tallyContracts.map((tallyContract) => (
              <Picker.Item key={tallyContract.name} label={tallyContract.title} value={tallyContract.rid} />
            ))
          }
        </Picker>

        <View style={styles.detailControl}>
          <HelpText
            label={'Partner Certificate Information'}
          />

          <View style={styles.certInfoWrapper}>
            <View style={styles.certInfo}>
              <HelpText
                label={'Formal Name'}
                style={styles.certInfoLabel}
              />
              
              <Text style={{ color: colors.black }}>
                Name
              </Text>
            </View>

            <View style={styles.certInfo}>
              <HelpText
                label={'Chip Address'}
                style={styles.certInfoLabel}
              />
              
              <Text style={{ color: colors.black }}>
                Name
              </Text>
            </View>

            <View style={styles.certInfo}>
              <HelpText
                label={'Chip Address'}
                style={styles.certInfoLabel}
              />
              
              <Text style={{ color: colors.black }}>
                Name
              </Text>
            </View>

            <TouchableWithoutFeedback>
              <Text style={styles.certOtherDetails}>
                View other details
              </Text>
            </TouchableWithoutFeedback>
          </View>
        </View>

        <View style={styles.detailControl}>
          <HelpText
            label={'My Certificate Information'}
          />

          <View style={styles.certInfoWrapper}>
            <View style={styles.certInfo}>
              <HelpText
                label={'Formal Name'}
                style={styles.certInfoLabel}
              />
              
              <Text style={{ color: colors.black }}>
                Name
              </Text>
            </View>

            <View style={styles.certInfo}>
              <HelpText
                label={'Chip Address'}
                style={styles.certInfoLabel}
              />
              
              <Text style={{ color: colors.black }}>
                Name
              </Text>
            </View>

            <View style={styles.certInfo}>
              <HelpText
                label={'Chip Address'}
                style={styles.certInfoLabel}
              />
              
              <Text style={{ color: colors.black }}>
                Name
              </Text>
            </View>

            <TouchableWithoutFeedback>
              <Text style={styles.certOtherDetails}>
                View other details
              </Text>
            </TouchableWithoutFeedback>
          </View>
        </View>
      </View>

      <View style={styles.detailControl}>
        <HelpText
          label={talliesText?.comment?.title ?? ''}
          helpText={talliesText?.comment?.help}
        />

        <TextInput
          multiline
          numberOfLines={4}
          value={comment}
          style={[styles.input, styles.comment]}
          onChangeText={setComment}
        />
      </View>

      <View style={styles.detailControl}>
        <HelpText
          label={talliesText?.tally_uuid?.title ?? ''}
          helpText={talliesText?.tally_uuid?.help}
        />

        <Text style={{ color: colors.black }}>
          {tally.tally_uuid}
        </Text>
      </View>

      <View style={styles.detailControl}>
        <HelpText
          label={talliesText?.tally_date?.title ?? ''}
          helpText={talliesText?.tally_date?.help}
        />
        <Text style={{ color: colors.black }}>
          {moment(tally.tally_date).format('MM/DD/YYYY,hh:mm')} 
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  detailControl: {
    marginVertical: 10
  },
  contractLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    padding: 10,
    borderColor: colors.gray,
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: colors.white,
  },
  certInfoWrapper: {
    backgroundColor: '#f2f2f2',
    borderWidth: 1,
    borderColor: '#dfdfdf',
    borderRadius: 8,
    padding: 16,
  },
  certInfo: {
    marginBottom: 12,
  },
  certInfoLabel: {
    marginBottom: 0,
    color: '#636363',
  },
  certOtherDetails: {
    color: '#155CEF',
    textDecorationLine: 'underline',
  },
  comment: {
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
  },
  headerText: {
    color: colors.black,
    fontSize: 14,
  },
  showPDF: {
    marginVertical: 8,
    color: colors.blue,
    backgroundColor: colors.white,
  },
  h5: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 'bold',
  },
})

export default TallyEditView;
