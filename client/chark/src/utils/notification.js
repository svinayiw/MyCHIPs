import { EventType } from '@notifee/react-native';
import { CommonActions, StackActions, TabActions } from '@react-navigation/native';

export const handleNotification = ({
  navigationRef,
  ...event
}) => {
  const { type, detail } = event;

  switch (type) {
    case EventType.DISMISSED:
      console.log('User dismissed notification', detail.notification);
      break;

    case EventType.PRESS:
      const data = detail.notification?.data ?? {};
      // navigationRef.current?.navigate?.('TallyPreview', { ...data })
      navigationRef?.current?.navigate?.(
        "TallyInvite",
        {
          screen: "Invite",
          params: {
            ...{
              notification: { ...data }
            }
          },
        }
      );
      break;

    default:
      break;
  }

}
