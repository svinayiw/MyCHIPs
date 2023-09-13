import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Toast from 'react-native-toast-message';
import { colors } from '../../config/constants';
import { random } from '../../utils/common';
import useSocket from '../../hooks/useSocket';
import useInvite from '../../hooks/useInvite';
import { createTemplate } from '../../services/tally';
import TemplateItem from './TemplateItem';
import CustomTextInput from '../../components/CustomTextInput';
import { FilterSecondIcon, SearchIcon } from '../../components/SvgAssets/SvgAssets';
import FloatingActionButton from '../../components/FloadingActionButton';
import useProfile from '../../hooks/useProfile';
import BottomSheetModal from '../../components/BottomSheetModal';
import CommentContent from './CommentContent';
import LimitContent from './LimitContent';
import SuccessContent from './SuccessContent';
import { useDispatch } from 'react-redux';
import { inviteSlice } from '../../redux/reducers/inviteSlices';


const Header_Height = 160;

const useSearchData = (initialData) => {
  const [searchValue, setSearchValue] = useState('');
  const [filteredData, setFilteredData] = useState(initialData);

  useEffect(() => {
    if (searchValue) {
      const filtered = initialData.filter((item) => {
        const userName = item.part_cert?.name;
        const name = `${userName?.first}${userName?.middle ? ' ' + userName?.middle + ' ' : ''} ${userName?.surname}`
        return name.toLowerCase().includes(searchValue.toLowerCase());
      });
      setFilteredData(filtered);
    } else {
      setFilteredData(initialData);
    }
  }, [searchValue, initialData]);

  return { searchValue, setSearchValue, filteredData };
};

const EmptyContent = () => {
  return <View style={{ flex: 1, alignItems: 'center', alignContent: 'center' }}>
    <Text>No Tallies Found with the status.</Text>
  </View>
}

const TallyInvite = (props) => {
  const [data, setData] = useState([]);
  const { searchValue, setSearchValue, filteredData } = useSearchData(data);
  const [loading, setLoading] = useState(false);
  const { wm, ws, tallyNegotiation } = useSocket();
  const { triggerInviteFetch } = useInvite();
  const { filter } = useProfile();
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [tallyItem, setTallyItem] = useState({});

  const dispatch = useDispatch()

  useEffect(() => {
    if (ws) {
      fetchTemplates();
    }
  }, [ws, triggerInviteFetch, filter, tallyNegotiation]);

  const getFilterResult = (filterBy, separatedBy) => {
    const values = Object.values(filter);
    const selectedValues = values.filter((item) => item.selected);
    const entry = selectedValues.length === 0
      ? values.map((item) => item?.[filterBy]).join(separatedBy)
      : selectedValues.map((item) => item?.[filterBy]).join(separatedBy);
    return entry;
  }

  //Create a new template
  const newTemplate = () => {
    const payload = {
      contract: { terms: 'Some Terms' },
      comment: tallyItem.comment ?? 'Test: ' + new Date(),
      tally_type: tallyItem.tally_type,
      hold_terms: {
        call: 30,
        limit: tallyItem.tally_type === 'foil' ? tallyItem.limit : null
      },
      part_terms: {
        call: 30,
        limit: tallyItem.tally_type === 'stock' ? tallyItem.limit : null
      },
    }
    
    createTemplate(wm, payload).then((data) => {
      setShowSuccess(true);
      fetchTemplates()
    }).catch(err => {
      Toast.show({
        type: 'error',
        text1: err?.message ?? 'Error creating new template',
      });
    })
  }

  const fetchTemplates = () => {
    const entry = getFilterResult('status', ' ');
    setLoading(true);
    const spec = {
      fields: [
        'tally_ent',
        'tally_seq',
        'contract',
        'comment',
        'tally_uuid',
        'hold_terms',
        'part_terms',
        'tally_type',
        'status',
        'part_cid',
        'part_cert',
        'hold_cert',
      ],
      view: 'mychips.tallies_v_me',
      where: { left: "status", oper: "in", entry: entry },
      order: {
        field: 'crt_date',
        asc: false,
      }
    }

    wm.request('_inv_ref' + random(), 'select', spec, (data, err) => {
      const _data = data?.map(el => ({
        tally_uuid: el.tally_uuid,
        tally_ent: el.tally_ent,
        id: el.tally_seq,
        contract: el.contract,
        comment: el.comment,
        hold_terms: el.hold_terms,
        part_terms: el.part_terms,
        tally_type: el.tally_type,
        status: el.status,
        part_cid: el.part_cid,
        part_cert: el.part_cert,
        hold_cert: el.hold_cert,
      }));

      dispatch(inviteSlice.actions.saveInvites(_data));

      setData(_data);
      setLoading(false);
    });
  }

  const renderItem = ({ item, index }) => {
    return (
      <TemplateItem
        testID={`tally-${index}`}
        template={item}
        navigation={props.navigation}
        onItemSelected={item => {
          props.navigation.navigate('TallyPreview', {
            tally_seq: item.id,
            tally_ent: item.tally_ent,
          });
        }}
      />
    )
  }

  const onFilter = () => {
    props.navigation.navigate("FilterScreen");
  }

  const scrollY = new Animated.Value(0);
  const diffClampScrollY = Animated.diffClamp(scrollY, 0, Header_Height);
  const headerY = diffClampScrollY.interpolate({
    inputRange: [0, Header_Height],
    outputRange: [0, -Header_Height],
    extrapolate: 'clamp'
  });

  return (
    <>
      <View style={styles.container}>
        <Animated.View style={[styles.header, { transform: [{ translateY: headerY }] }]}>
          <Text style={styles.h1}>Working Tallies</Text>
          <View style={[styles.row, { marginVertical: 22 }]}>
            <Text style={styles.title}>{getFilterResult('title', ' | ')}</Text>
            <TouchableOpacity style={styles.filterContainer} onPress={onFilter}>
              <FilterSecondIcon />
              <Text style={styles.filterText}>Filters</Text>
            </TouchableOpacity>
          </View>
          <CustomTextInput
            placeholder="Search"
            value={searchValue}
            onChangeText={setSearchValue}
            leadingIcon={<SearchIcon size={16} />}
          />
        </Animated.View>

        <Animated.FlatList
          bounces={false}
          ListHeaderComponent={<View style={{ height: Header_Height, marginTop: 8 }} />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, backgroundColor: colors.white }}
          data={filteredData}
          renderItem={renderItem}
          refreshing={loading}
          onRefresh={() => fetchTemplates()}
          keyExtractor={(item, index) => `${item?.tally_uuid}${index}`}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          scrollEventThrottle={2}
          ListEmptyComponent={loading ? <></> : <EmptyContent />}
          onScroll={Animated.event(
            [{
              nativeEvent: { contentOffset: { y: scrollY } }
            }],
            {
              useNativeDriver: false,
            }
          )}
          progressViewOffset={150}
        />
        <FloatingActionButton onPress={() => setShowCommentModal(true)} />
      </View>
      <BottomSheetModal
        isVisible={showCommentModal}
        onClose={() => setShowCommentModal(false)}
      >
        <CommentContent
          onNext={(item) => {
            setTallyItem({ ...tallyItem, ...item })
            setShowCommentModal(false);
            setShowLimitModal(true);
          }}
          onDismiss={() => {
            setShowCommentModal(false);
          }}
        />
      </BottomSheetModal>

      <BottomSheetModal
        isVisible={showLimitModal}
        onClose={() => setShowLimitModal(false)}
      >
        <LimitContent
          onNext={(item) => {
            setTallyItem({ ...tallyItem, ...item })
            setShowLimitModal(false);
            newTemplate();
          }}
          onDismiss={() => {
            setShowLimitModal(false);
          }}
        />
      </BottomSheetModal>

      <BottomSheetModal
        isVisible={showSuccess}
        onClose={() => setShowSuccess(false)}
      >
        <SuccessContent
          onDone={() => {
            setShowSuccess(false)
          }}
          onDismiss={() => {
            setShowSuccess(false);
          }}
        />
      </BottomSheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 16,
    color: colors.gray300,
    fontFamily: 'inter'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  filterContainer: {
    borderWidth: 1,
    borderColor: colors.white100,
    backgroundColor: colors.white200,
    flexDirection: 'row',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 3,
    justifyContent: 'center',
    alignItems: 'center'
  },
  filterText: {
    fontSize: 12,
    color: '#636363',
    marginStart: 4,
    fontFamily: 'inter',
  },
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: Header_Height,
    backgroundColor: colors.white,
    zIndex: 1000,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  h1: {
    fontSize: 18,
    fontFamily: 'inter',
    fontWeight: '500',
    color: '#636363',
    alignSelf: 'center',
  },
})

export default TallyInvite;
