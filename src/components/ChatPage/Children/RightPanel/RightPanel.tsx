import { Label } from "@radix-ui/react-label";
import { produce } from "immer";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { SetSharedState } from "~/hooks/useJsonData";
import { Model } from "~/lib/constants";
import { Persona, Preferences } from "~/lib/typesJsonData";
import useGlobalContext, {
  LogLevel,
} from "~/providers/context/useGlobalContext";
import ModelSelector from "../ModelSelector";
interface RightPanelProps {
  preferences: Preferences;
  autoReadAloudEnabled?: boolean;
  setAutoReadAloudEnabled: SetSharedState<boolean>;
  setPreferences: SetSharedState<Preferences>;
  model: Model;
  setModel: SetSharedState<Model>;
  persona?: Persona;
}
const RightPanel: React.FC<RightPanelProps> = ({
  preferences,
  setPreferences,
  model,
  setModel,
  persona,
  autoReadAloudEnabled,
  setAutoReadAloudEnabled,
}) => {
  const { logLevel, setLogLevel } = useGlobalContext();
  return (
    <div className="h-full flex flex-col">
      <div className="p-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="autoReadAloud"
            checked={autoReadAloudEnabled}
            onCheckedChange={(value) => {
              setAutoReadAloudEnabled(value);
            }}
          />
          <Label htmlFor="autoReadAloud">Auto Read Aloud</Label>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="instructions"
            checked={preferences.instructions.enabled}
            onCheckedChange={(value) => {
              setPreferences(
                produce((draft) => {
                  if (!draft) return;
                  draft.instructions.enabled = value;
                })
              );
            }}
          />
          <Label htmlFor="instructions">Instructions</Label>
        </div>
        {preferences.instructions.enabled && (
          <div className="pl-4 pt-2 space-y-2 scale-90 origin-top-left">
            <div className="flex items-center space-x-2">
              <Switch
                id="userDetails"
                checked={preferences.instructions.children.userDetails.enabled}
                onCheckedChange={(value) => {
                  setPreferences(
                    produce((draft) => {
                      if (!draft) return;
                      draft.instructions.children.userDetails.enabled = value;
                    })
                  );
                }}
              />
              <Label htmlFor="userDetails">User Details</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="memory"
                checked={preferences.instructions.children.memory.enabled}
                onCheckedChange={(value) => {
                  setPreferences(
                    produce((draft) => {
                      if (!draft) return;
                      draft.instructions.children.memory.enabled = value;
                    })
                  );
                }}
              />
              <Label htmlFor="memory">Memory</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="currentDate"
                checked={preferences.instructions.children.currentDate.enabled}
                onCheckedChange={(value) => {
                  setPreferences(
                    produce((draft) => {
                      if (!draft) return;
                      draft.instructions.children.currentDate.enabled = value;
                    })
                  );
                }}
              />
              <Label htmlFor="currentDate">Current Date</Label>
            </div>
            {persona && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="persona"
                  checked={preferences.instructions.children.persona.enabled}
                  onCheckedChange={(value) => {
                    setPreferences(
                      produce((draft) => {
                        if (!draft) return;
                        draft.instructions.children.persona.enabled = value;
                      })
                    );
                  }}
                />
                <Label htmlFor="persona">Persona</Label>
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="related-questions"
                  checked={
                    preferences.instructions.children.relatedQuestion.enabled
                  }
                  onCheckedChange={(value) => {
                    setPreferences(
                      produce((draft) => {
                        if (!draft) return;
                        draft.instructions.children.relatedQuestion.enabled =
                          value;
                      })
                    );
                  }}
                />
                <Label htmlFor="related-questions">Related Questions</Label>
              </div>
              {preferences.instructions.children.relatedQuestion.enabled && (
                <>
                  <div className="h-4"></div>
                  <div>
                    <Input
                      type="number"
                      placeholder="3"
                      min={1}
                      max={5}
                      value={
                        preferences.instructions.children.relatedQuestion
                          .count === 0
                          ? ""
                          : preferences.instructions.children.relatedQuestion
                              .count
                      }
                      onChange={(e) => {
                        setPreferences(
                          produce((draft) => {
                            if (!draft) return;
                            const value = +e.target.value;
                            if (value > 5) return;
                            draft.instructions.children.relatedQuestion.count =
                              value;
                          })
                        );
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="h-4"></div>
        <div>
          <ModelSelector model={model} setModel={setModel} />
        </div>
        <div className="h-4"></div>
        <Select
          value={logLevel}
          onValueChange={(value) => {
            setLogLevel(value as LogLevel);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Log Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {[LogLevel.DEBUG, LogLevel.INFO].map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
export default RightPanel;
