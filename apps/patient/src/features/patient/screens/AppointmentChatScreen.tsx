import React from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { AppointmentStackParamList } from '../../../../../../packages/core/src/types';
import { COLORS } from '../../../../../../packages/core/src/constants';
import ChatScreen from '../../../../../../packages/shared/src/components/ChatScreen';

type Route = RouteProp<AppointmentStackParamList, 'AppointmentChat'>;

export default function AppointmentChatScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { appointmentId, doctorName } = route.params;

  return (
    <ChatScreen
      appointmentId={appointmentId}
      otherPersonName={doctorName}
      isDoctor={false}
      accentColor={COLORS.primary}
      onBack={() => navigation.goBack()}
    />
  );
}
