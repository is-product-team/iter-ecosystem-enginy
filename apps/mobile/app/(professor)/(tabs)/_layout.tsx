import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { THEME } from '@iter/shared';
import { useColorScheme } from 'nativewind';

const AnyIcon = Icon as any;

export default function ProfessorTabsLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Tauler</Label>
        <AnyIcon sf="square.grid.2x2" md="dashboard" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="avisos">
        <Label>Avisos</Label>
        <AnyIcon sf="bell" md="notifications" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="talleres">
        <Label>Calendari</Label>
        <AnyIcon sf="calendar" md="calendar_today" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="coordinacion">
        <Label>Col·laboració</Label>
        <AnyIcon sf="person.2" md="people" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="perfil">
        <Label>Perfil</Label>
        <AnyIcon sf="person.crop.circle" md="account_circle" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
