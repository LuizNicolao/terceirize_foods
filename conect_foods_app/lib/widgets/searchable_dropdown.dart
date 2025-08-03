import 'package:flutter/material.dart';
import 'package:conect_foods_app/utils/app_colors.dart';

class SearchableDropdown<T> extends StatefulWidget {
  final T? value;
  final String labelText;
  final String? hintText;
  final IconData? prefixIcon;
  final List<DropdownMenuItem<T>> items;
  final ValueChanged<T?> onChanged;
  final String? Function(T?) validator;
  final bool enabled;

  const SearchableDropdown({
    super.key,
    required this.value,
    required this.labelText,
    this.hintText,
    this.prefixIcon,
    required this.items,
    required this.onChanged,
    required this.validator,
    this.enabled = true,
  });

  @override
  State<SearchableDropdown<T>> createState() => _SearchableDropdownState<T>();
}

class _SearchableDropdownState<T> extends State<SearchableDropdown<T>> {
  final TextEditingController _searchController = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  bool _isOpen = false;
  List<DropdownMenuItem<T>> _filteredItems = [];

  @override
  void initState() {
    super.initState();
    _filteredItems = widget.items;
    _searchController.addListener(_filterItems);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _filterItems() {
    final query = _searchController.text.toLowerCase();
    setState(() {
      _filteredItems = widget.items
          .where((item) => item.child.toString().toLowerCase().contains(query))
          .toList();
    });
  }

  void _toggleDropdown() {
    if (!widget.enabled) return;
    
    setState(() {
      _isOpen = !_isOpen;
      if (_isOpen) {
        _searchController.clear();
        _filteredItems = widget.items;
      }
    });
    
    if (_isOpen) {
      _focusNode.requestFocus();
    }
  }

  void _selectItem(T? item) {
    widget.onChanged(item);
    setState(() {
      _isOpen = false;
    });
  }

  String _getDisplayText() {
    if (widget.value == null) {
      return widget.hintText ?? widget.labelText;
    }
    
    final selectedItem = widget.items.firstWhere(
      (item) => item.value == widget.value,
      orElse: () => DropdownMenuItem<T>(
        value: widget.value,
        child: Text(widget.value.toString()),
      ),
    );
    
    return selectedItem.child.toString();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Campo principal
        GestureDetector(
          onTap: _toggleDropdown,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey[300]!),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Row(
              children: [
                if (widget.prefixIcon != null) ...[
                  Icon(widget.prefixIcon, color: AppColors.primaryGreen),
                  const SizedBox(width: 12),
                ],
                Expanded(
                  child: Text(
                    _getDisplayText(),
                    style: TextStyle(
                      color: widget.value != null ? Colors.black : Colors.grey[500],
                      fontSize: 16,
                    ),
                  ),
                ),
                Icon(
                  _isOpen ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                  color: AppColors.primaryGreen,
                ),
              ],
            ),
          ),
        ),
        
        // Dropdown com busca (sem animações para melhor performance)
        if (_isOpen) ...[
          const SizedBox(height: 4),
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border.all(color: Colors.grey[300]!),
              borderRadius: BorderRadius.circular(4),
              // Removida sombra para melhor performance
            ),
            constraints: const BoxConstraints(maxHeight: 200),
            child: Column(
              children: [
                // Campo de busca
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: TextField(
                    controller: _searchController,
                    focusNode: _focusNode,
                    decoration: InputDecoration(
                      hintText: 'Buscar...',
                      prefixIcon: const Icon(Icons.search, color: AppColors.primaryGreen),
                      border: const OutlineInputBorder(),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    ),
                    style: const TextStyle(fontSize: 14),
                  ),
                ),
                
                // Lista de itens
                Flexible(
                  child: ListView.builder(
                    shrinkWrap: true,
                    itemCount: _filteredItems.length,
                    itemBuilder: (context, index) {
                      final item = _filteredItems[index];
                      final isSelected = item.value == widget.value;
                      
                      return ListTile(
                        title: item.child,
                        onTap: () => _selectItem(item.value),
                        tileColor: isSelected ? AppColors.primaryGreen.withOpacity(0.1) : null,
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}

// Versão compatível para List<String> (mantém compatibilidade com código existente)
class SearchableDropdownString extends StatefulWidget {
  final String? value;
  final String labelText;
  final IconData prefixIcon;
  final List<String> items;
  final ValueChanged<String?> onChanged;
  final String? Function(String?) validator;
  final bool enabled;

  const SearchableDropdownString({
    super.key,
    required this.value,
    required this.labelText,
    required this.prefixIcon,
    required this.items,
    required this.onChanged,
    required this.validator,
    this.enabled = true,
  });

  @override
  State<SearchableDropdownString> createState() => _SearchableDropdownStringState();
}

class _SearchableDropdownStringState extends State<SearchableDropdownString> {
  final TextEditingController _searchController = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  bool _isOpen = false;
  List<String> _filteredItems = [];

  @override
  void initState() {
    super.initState();
    _filteredItems = widget.items;
    _searchController.addListener(_filterItems);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _filterItems() {
    final query = _searchController.text.toLowerCase();
    setState(() {
      _filteredItems = widget.items
          .where((item) => item.toLowerCase().contains(query))
          .toList();
    });
  }

  void _toggleDropdown() {
    if (!widget.enabled) return;
    
    setState(() {
      _isOpen = !_isOpen;
      if (_isOpen) {
        _searchController.clear();
        _filteredItems = widget.items;
      }
    });
    
    if (_isOpen) {
      _focusNode.requestFocus();
    }
  }

  void _selectItem(String? item) {
    widget.onChanged(item);
    setState(() {
      _isOpen = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Campo principal
        GestureDetector(
          onTap: _toggleDropdown,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey[300]!),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Row(
              children: [
                Icon(widget.prefixIcon, color: AppColors.primaryGreen),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    widget.value ?? widget.labelText,
                    style: TextStyle(
                      color: widget.value != null ? Colors.black : Colors.grey[500],
                      fontSize: 16,
                    ),
                  ),
                ),
                Icon(
                  _isOpen ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                  color: AppColors.primaryGreen,
                ),
              ],
            ),
          ),
        ),
        
        // Dropdown com busca (sem animações para melhor performance)
        if (_isOpen) ...[
          const SizedBox(height: 4),
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border.all(color: Colors.grey[300]!),
              borderRadius: BorderRadius.circular(4),
              // Removida sombra para melhor performance
            ),
            constraints: const BoxConstraints(maxHeight: 200),
            child: Column(
              children: [
                // Campo de busca
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: TextField(
                    controller: _searchController,
                    focusNode: _focusNode,
                    decoration: InputDecoration(
                      hintText: 'Buscar...',
                      prefixIcon: const Icon(Icons.search, color: AppColors.primaryGreen),
                      border: const OutlineInputBorder(),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    ),
                    style: const TextStyle(fontSize: 14),
                  ),
                ),
                
                // Lista de itens
                Flexible(
                  child: ListView.builder(
                    shrinkWrap: true,
                    itemCount: _filteredItems.length,
                    itemBuilder: (context, index) {
                      final item = _filteredItems[index];
                      final isSelected = item == widget.value;
                      
                      return ListTile(
                        title: Text(
                          item,
                          style: TextStyle(
                            fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                            color: isSelected ? AppColors.primaryGreen : Colors.black,
                          ),
                        ),
                        onTap: () => _selectItem(item),
                        tileColor: isSelected ? AppColors.primaryGreen.withOpacity(0.1) : null,
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
} 