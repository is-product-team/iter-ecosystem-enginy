import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { useTranslation } from 'react-i18next';

const AnyIcon = Icon as any;

export default function ProfessorTabsLayout() {
  const { t } = useTranslation();

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>{t('Tabs.dashboard')}</Label>
        <AnyIcon sf="square.grid.2x2" md="dashboard" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="notifications">
        <Label>{t('Tabs.notifications')}</Label>
        <AnyIcon sf="bell" md="notifications" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="calendar">
        <Label>{t('Tabs.calendar')}</Label>
        <AnyIcon sf="calendar" md="calendar_today" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="coordination">
        <Label>{t('Tabs.coordination')}</Label>
        <AnyIcon sf="person.2" md="people" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <Label>{t('Tabs.profile')}</Label>
        <AnyIcon sf="person.crop.circle" md="account_circle" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
