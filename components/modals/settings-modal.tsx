import useMenuStatesContext from "@/lib/hooks/use-menu-states-context";
import {
  Divider,
  Input,
  Select,
  SelectItem,
  Switch,
  Tooltip,
} from "@nextui-org/react";
import { useState } from "react";
import { llmProviderOptions } from "@/lib/llm/options";
import { sttProviderOptions } from "@/lib/stt/options";
import { ttsProviderOptions } from "@/lib/tts/options";
import toast from "react-hot-toast";
import ModalWrapper from "./modal-wrapper";

export default function SettingModal({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) {
  const { menuStates, updateMenuStates } = useMenuStatesContext();
  const [ttl, setTTL] = useState<string>("14");
  return (
    <ModalWrapper isOpen={isOpen} setIsOpen={setIsOpen}>
      <>
        <p className="text-center text-lg font-bold text-foreground">
          Settings
        </p>
        <div className="mt-2 flex w-full flex-col gap-2">
          <div>
            <p className="text-small text-foreground">STT</p>
            <div className="w-full space-y-2">
              <Select
                items={sttProviderOptions}
                disabledKeys={sttProviderOptions
                  .filter((provider) => !provider.isSupported)
                  .map((provider) => provider.provider)}
                label="Provider"
                placeholder="Select a provider"
                onChange={(e) => {
                  const settings = menuStates?.settings ?? {};
                  updateMenuStates({
                    settings: {
                      ...settings,
                      sttProvider: e.target.value,
                      sttModel: undefined,
                      sttAPIKey: undefined,
                    },
                  });
                }}
                isRequired
                selectedKeys={
                  menuStates?.settings?.sttProvider
                    ? [menuStates.settings.sttProvider]
                    : []
                }
              >
                {(providerOption) => (
                  <SelectItem key={providerOption.provider}>
                    {providerOption.provider}
                  </SelectItem>
                )}
              </Select>
              <Select
                isDisabled={!menuStates?.settings?.sttProvider}
                items={
                  sttProviderOptions.find(
                    (provider) =>
                      provider.provider === menuStates?.settings?.sttProvider,
                  )?.models ?? []
                }
                disabledKeys={
                  sttProviderOptions
                    .find(
                      (provider) =>
                        provider.provider === menuStates?.settings?.sttProvider,
                    )
                    ?.models.filter((model) => !model.isSupported)
                    .map((model) => model.model) ?? []
                }
                label="Model"
                placeholder="Select a model"
                isRequired
                selectedKeys={
                  menuStates?.settings?.sttModel
                    ? [menuStates.settings.sttModel]
                    : []
                }
                onChange={(e) => {
                  const settings = menuStates?.settings ?? {};
                  updateMenuStates({
                    settings: {
                      ...settings,
                      sttModel: e.target.value,
                    },
                  });
                }}
              >
                {(modelOption) => (
                  <SelectItem key={modelOption.model}>
                    {modelOption.model}
                  </SelectItem>
                )}
              </Select>
              <Tooltip
                content={
                  <p>
                    Please disable password to edit API Key. <br />
                    You can enable password again after editing API keys.
                  </p>
                }
                isDisabled={!menuStates?.settings?.isUsePassword}
              >
                <Input
                  label="API Key"
                  size="md"
                  isRequired
                  value={menuStates?.settings?.sttAPIKey ?? ""}
                  onValueChange={(value) => {
                    const settings = menuStates?.settings ?? {};
                    updateMenuStates({
                      settings: {
                        ...settings,
                        sttAPIKey: value,
                      },
                    });
                  }}
                  isDisabled={!menuStates?.settings?.sttProvider}
                  isReadOnly={menuStates?.settings?.isUsePassword}
                />
              </Tooltip>
            </div>
          </div>
          <Divider />
          <div>
            <p className="text-small text-foreground">LLM</p>
            <div className="w-full space-y-2">
              <Select
                items={llmProviderOptions}
                disabledKeys={llmProviderOptions
                  .filter((provider) => !provider.isSupported)
                  .map((provider) => provider.provider)}
                label="Provider"
                placeholder="Select a provider"
                onChange={(e) => {
                  const settings = menuStates?.settings ?? {};
                  updateMenuStates({
                    settings: {
                      ...settings,
                      llmProvider: e.target.value,
                      llmModel: undefined,
                      llmAPIKey: undefined,
                    },
                  });
                }}
                isRequired
                selectedKeys={
                  menuStates?.settings?.llmProvider
                    ? [menuStates.settings.llmProvider]
                    : []
                }
              >
                {(providerOption) => (
                  <SelectItem key={providerOption.provider}>
                    {providerOption.provider}
                  </SelectItem>
                )}
              </Select>
              <Select
                isDisabled={!menuStates?.settings?.llmProvider}
                items={
                  llmProviderOptions.find(
                    (provider) =>
                      provider.provider === menuStates?.settings?.llmProvider,
                  )?.models ?? []
                }
                disabledKeys={
                  llmProviderOptions
                    .find(
                      (provider) =>
                        provider.provider === menuStates?.settings?.llmProvider,
                    )
                    ?.models.filter((model) => !model.isSupported)
                    .map((model) => model.model) ?? []
                }
                label="Model"
                placeholder="Select a model"
                isRequired
                onChange={(e) => {
                  const settings = menuStates?.settings ?? {};
                  updateMenuStates({
                    settings: {
                      ...settings,
                      llmModel: e.target.value,
                    },
                  });
                }}
                selectedKeys={
                  menuStates?.settings?.llmModel
                    ? [menuStates?.settings?.llmModel]
                    : []
                }
              >
                {(modelOption) => (
                  <SelectItem key={modelOption.model}>
                    {modelOption.model}
                  </SelectItem>
                )}
              </Select>
              <Tooltip
                content={
                  <p>
                    Please disable password to edit API Key. <br />
                    You can enable password again after editing API keys.
                  </p>
                }
                isDisabled={!menuStates?.settings?.isUsePassword}
              >
                <Input
                  label="API Key"
                  size="md"
                  isRequired
                  value={menuStates?.settings?.llmAPIKey ?? ""}
                  onValueChange={(value) => {
                    const settings = menuStates?.settings ?? {};
                    updateMenuStates({
                      settings: {
                        ...settings,
                        llmAPIKey: value,
                      },
                    });
                  }}
                  isDisabled={!menuStates?.settings?.llmProvider}
                  isReadOnly={menuStates?.settings?.isUsePassword}
                />
              </Tooltip>
            </div>
          </div>
          <Divider />
          <div>
            <p className="text-small text-foreground">TTS</p>
            <div className="w-full space-y-2">
              <Select
                items={ttsProviderOptions}
                disabledKeys={ttsProviderOptions
                  .filter((provider) => !provider.isSupported)
                  .map((provider) => provider.provider)}
                label="Provider"
                placeholder="Select a provider"
                onChange={(e) => {
                  const settings = menuStates?.settings ?? {};
                  updateMenuStates({
                    settings: {
                      ...settings,
                      ttsProvider: e.target.value,
                      ttsModel: undefined,
                      ttsAPIKey: undefined,
                    },
                  });
                }}
                isRequired
                selectedKeys={
                  menuStates?.settings?.ttsProvider
                    ? [menuStates?.settings?.ttsProvider]
                    : []
                }
              >
                {(providerOption) => (
                  <SelectItem key={providerOption.provider}>
                    {providerOption.provider}
                  </SelectItem>
                )}
              </Select>
              <Select
                isDisabled={!menuStates?.settings?.ttsProvider}
                items={
                  ttsProviderOptions.find(
                    (provider) =>
                      provider.provider === menuStates?.settings?.ttsProvider,
                  )?.models ?? []
                }
                disabledKeys={
                  ttsProviderOptions
                    .find(
                      (provider) =>
                        provider.provider === menuStates?.settings?.ttsProvider,
                    )
                    ?.models.filter((model) => !model.isSupported)
                    .map((model) => model.model) ?? []
                }
                label="Model"
                placeholder="Select a model"
                isRequired
                onChange={(e) => {
                  const settings = menuStates?.settings ?? {};
                  updateMenuStates({
                    settings: {
                      ...settings,
                      ttsModel: e.target.value,
                    },
                  });
                }}
                selectedKeys={
                  menuStates?.settings?.ttsModel
                    ? [menuStates?.settings?.ttsModel]
                    : []
                }
              >
                {(modelOption) => (
                  <SelectItem key={modelOption.model}>
                    {modelOption.model}
                  </SelectItem>
                )}
              </Select>
              <Input
                label="Voice Name"
                size="md"
                isRequired
                value={menuStates?.settings?.ttsVoice ?? ""}
                onValueChange={(value) => {
                  const settings = menuStates?.settings ?? {};
                  updateMenuStates({
                    settings: {
                      ...settings,
                      ttsVoice: value,
                    },
                  });
                }}
                isDisabled={!menuStates?.settings?.ttsProvider}
              />
              <Tooltip
                content={
                  <p>
                    Please disable password to edit API Key. <br />
                    You can enable password again after editing API keys.
                  </p>
                }
                isDisabled={!menuStates?.settings?.isUsePassword}
              >
                <Input
                  label="API Key"
                  size="md"
                  isRequired
                  value={menuStates?.settings?.ttsAPIKey ?? ""}
                  onValueChange={(value) => {
                    const settings = menuStates?.settings ?? {};
                    updateMenuStates({
                      settings: {
                        ...settings,
                        ttsAPIKey: value,
                      },
                    });
                  }}
                  isDisabled={!menuStates?.settings?.ttsProvider}
                  isReadOnly={menuStates?.settings?.isUsePassword}
                />
              </Tooltip>
            </div>
          </div>
          <Divider />
          <p className="text-small text-foreground">Security</p>
          <p className="text-small text-foreground">
            This app currently runs in browser environment and has not yet
            implemented a backend or system file APIs using Electronjs or
            Capacitorjs. Therefore, the API tokens are stored in the
            browser&apos;s local storage and can be prone to attacks. Use a
            password to encrypt the API tokens as a temporary workaround.
          </p>
          <Switch
            isSelected={menuStates?.settings?.isUsePassword ?? false}
            onChange={(e) => {
              const newValue = e.target.checked;
              if (newValue) {
                setIsOpen(false);
                const settings = menuStates?.settings ?? {};
                updateMenuStates({
                  settings: {
                    ...settings,
                    isUsePassword: newValue,
                  },
                });
              } else {
                // Reset all settings
                updateMenuStates({
                  settings: undefined,
                });
              }
            }}
          >
            Encrypt API tokens with password
          </Switch>
          <p className="text-small text-foreground">
            The API tokens are saved for the duration of the TTL (Time To Live)
            days. After the TTL, the API tokens will be deleted when the app
            opens next time. Set -1 to keep the tokens indefinitely.
          </p>
          <Input
            label="TTL (in days)"
            size="md"
            isRequired
            defaultValue="14"
            value={ttl}
            onValueChange={(value) => {
              setTTL(value);

              let days = 14;

              days = parseInt(value);

              // Reset to default if invalid
              if (days < -1) {
                days = 14;
              } else if (Number.isNaN(days)) {
                days = 14;
                toast.error("Invalid input. Using default 14 days.");
              }

              const settings = menuStates?.settings ?? {};
              updateMenuStates({
                settings: {
                  ...settings,
                  ttl: days === -1 ? -1 : days * 86400000,
                },
              });
            }}
          />
        </div>
      </>
    </ModalWrapper>
  );
}