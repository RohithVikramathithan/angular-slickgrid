import { Locale } from '@slickgrid-universal/common';
export declare class Constants {
    static readonly locales: Locale;
    static readonly treeDataProperties: {
        CHILDREN_PROP: string;
        COLLAPSED_PROP: string;
        HAS_CHILDREN_PROP: string;
        TREE_LEVEL_PROP: string;
        PARENT_PROP: string;
    };
    static readonly VALIDATION_REQUIRED_FIELD = "Field is required";
    static readonly VALIDATION_EDITOR_VALID_NUMBER = "Please enter a valid number";
    static readonly VALIDATION_EDITOR_VALID_INTEGER = "Please enter a valid integer number";
    static readonly VALIDATION_EDITOR_INTEGER_BETWEEN = "Please enter a valid integer number between {{minValue}} and {{maxValue}}";
    static readonly VALIDATION_EDITOR_INTEGER_MAX = "Please enter a valid integer number that is lower than {{maxValue}}";
    static readonly VALIDATION_EDITOR_INTEGER_MAX_INCLUSIVE = "Please enter a valid integer number that is lower than or equal to {{maxValue}}";
    static readonly VALIDATION_EDITOR_INTEGER_MIN = "Please enter a valid integer number that is greater than {{minValue}}";
    static readonly VALIDATION_EDITOR_INTEGER_MIN_INCLUSIVE = "Please enter a valid integer number that is greater than or equal to {{minValue}}";
    static readonly VALIDATION_EDITOR_NUMBER_BETWEEN = "Please enter a valid number between {{minValue}} and {{maxValue}}";
    static readonly VALIDATION_EDITOR_NUMBER_MAX = "Please enter a valid number that is lower than {{maxValue}}";
    static readonly VALIDATION_EDITOR_NUMBER_MAX_INCLUSIVE = "Please enter a valid number that is lower than or equal to {{maxValue}}";
    static readonly VALIDATION_EDITOR_NUMBER_MIN = "Please enter a valid number that is greater than {{minValue}}";
    static readonly VALIDATION_EDITOR_NUMBER_MIN_INCLUSIVE = "Please enter a valid number that is greater than or equal to {{minValue}}";
    static readonly VALIDATION_EDITOR_DECIMAL_BETWEEN = "Please enter a valid number with a maximum of {{maxDecimal}} decimals";
    static readonly VALIDATION_EDITOR_TEXT_LENGTH_BETWEEN = "Please make sure your text length is between {{minLength}} and {{maxLength}} characters";
    static readonly VALIDATION_EDITOR_TEXT_MAX_LENGTH = "Please make sure your text is less than {{maxLength}} characters";
    static readonly VALIDATION_EDITOR_TEXT_MAX_LENGTH_INCLUSIVE = "Please make sure your text is less than or equal to {{maxLength}} characters";
    static readonly VALIDATION_EDITOR_TEXT_MIN_LENGTH = "Please make sure your text is more than {{minLength}} character(s)";
    static readonly VALIDATION_EDITOR_TEXT_MIN_LENGTH_INCLUSIVE = "Please make sure your text is at least {{minLength}} character(s)";
}
