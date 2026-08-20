// utils.js
const FormatUtils = {
    currency: function(value) {
        if (!value) return "0 €";
        if (value >= 1e9) {
            return (value / 1e9).toFixed(2) + ' Milliards €';
        } else if (value >= 1e6) {
            return (value / 1e6).toFixed(2) + ' Millions €';
        }
        return value.toLocaleString('fr-FR') + ' €';
    }
};