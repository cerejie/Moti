import { useRef, type ComponentProps, type ReactNode } from "react";
import { Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Popover } from "@/components/ui/popover";
import { cn } from "@/utils/cn.utils";
import {
  fieldInput,
  searchAnchor,
  searchResultsPanel,
} from "../../../styles/form/field.styles";

type IProps = Omit<ComponentProps<typeof InputGroupInput>, "type"> & {
  // What the search found, floated under the box so it takes no room in the
  // layout. Non-modal: the box stays live for the next search while it shows.
  resultsPanel?: ReactNode;
  resultsOpen?: boolean;
  onResultsOpenChange?: (open: boolean) => void;
};

// Search box with a leading magnifier, for filters and lookups.
const SearchInput = ({
  className,
  resultsPanel,
  resultsOpen = false,
  onResultsOpenChange,
  ...props
}: IProps) => {
  // The aria Group takes no ref, so the box is wrapped to give the panel
  // something to hang under. The caller's layout classes go on the wrapper.
  const anchorRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div ref={anchorRef} className={cn(searchAnchor, className)}>
        <InputGroup className={fieldInput}>
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput type="search" {...props} />
        </InputGroup>
      </div>

      {resultsPanel !== undefined && (
        <Popover
          triggerRef={anchorRef}
          isOpen={resultsOpen}
          onOpenChange={onResultsOpenChange}
          isNonModal
          // Clicking back into the box is not a dismissal.
          shouldCloseOnInteractOutside={(element) =>
            !anchorRef.current?.contains(element)
          }
          placement="bottom start"
          className={searchResultsPanel}
        >
          {resultsPanel}
        </Popover>
      )}
    </>
  );
};

export default SearchInput;
