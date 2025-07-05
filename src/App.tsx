import React, { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Textarea,
  List,
  ListItem,
  Heading,
  Badge,
  useToast,
  Input,
  InputGroup,
  InputLeftElement,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorMode,
  useColorModeValue,
  Code
} from '@chakra-ui/react'
import { SearchIcon, StarIcon, DeleteIcon, CopyIcon, SettingsIcon, MoonIcon, SunIcon } from '@chakra-ui/icons'
import { detectCode } from './utils/codeDetection'

interface ClipboardItem {
  id: string;
  content: string;
  timestamp: Date;
  isFavorite: boolean;
  type: 'text' | 'code' | 'url';
  language?: string | null;
  confidence?: number;
}

interface ClipboardListProps {
  items: ClipboardItem[];
  onCopy: (content: string) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onSelectItem: (id: string) => void;
}

function App() {
  const [clipboardHistory, setClipboardHistory] = useState<ClipboardItem[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const addToClipboard = () => {
    if (selectedText.trim()) {
      const contentType = getContentType(selectedText);
      const newItem: ClipboardItem = {
        id: Date.now().toString(),
        content: selectedText,
        timestamp: new Date(),
        isFavorite: false,
        type: contentType.type,
        language: contentType.language,
        confidence: contentType.confidence
      };
      setClipboardHistory(prev => [newItem, ...prev.slice(0, 49)]);
      setSelectedText('');
      toast({
        title: "Added to clipboard",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const getContentType = (content: string): { type: 'text' | 'code' | 'url', language?: string | null, confidence?: number } => {
    if (content.startsWith('http://') || content.startsWith('https://')) {
      return { type: 'url' };
    }
    const codeDetection = detectCode(content);
    if (codeDetection.isCode) {
      return {
        type: 'code',
        language: codeDetection.language,
        confidence: codeDetection.confidence
      };
    }
    return { type: 'text' };
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const toggleFavorite = (id: string) => {
    setClipboardHistory(prev => prev.map(item =>
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    ));
  };

  const deleteItem = (id: string) => {
    setClipboardHistory(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Item deleted",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const clearHistory = () => {
    setClipboardHistory([]);
    toast({
      title: "History cleared",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const filteredHistory = clipboardHistory.filter(item =>
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedItem = clipboardHistory.find(item => item.id === selectedItemId);

  return (
    <Box w="100vw" maxW="100vw" overflowX="hidden" minH="100vh" bg={bgColor}>
      <VStack spacing={4} p={4}>
        <HStack w="100%" maxW="100%" mx="0" justify="space-between">
          <Heading size="lg">SneakyClipboard</Heading>
          <HStack>
            <IconButton
              aria-label="Toggle dark mode"
              icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
              onClick={toggleColorMode}
            />
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="Settings"
                icon={<SettingsIcon />}
              />
              <MenuList>
                <MenuItem onClick={clearHistory}>Clear History</MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </HStack>

        <HStack w="100%" maxW="100%" mx="0" align="start" spacing={4}>
          {/* Left Section - 2/3 width */}
          <Box flex={{ base: '1 1 100%', md: '2 0 0' }} minW="0" w="100%">
            <VStack w="full" spacing={4}>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.500" />
                </InputLeftElement>
                <Input
                  placeholder="Search clipboard history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>

              <Box w="full" borderWidth={1} borderColor={borderColor} borderRadius="md" p={4}>
                <Tabs variant="soft-rounded" colorScheme="blue" mb={4}>
                  <TabList>
                    <Tab>All</Tab>
                    <Tab>URL</Tab>
                    <Tab>Code</Tab>
                    <Tab>Text</Tab>
                    <Tab>
                      <StarIcon color="yellow.400" mr={2} />
                      Favorites
                    </Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel px={0}>
                      <ClipboardList
                        items={filteredHistory}
                        onCopy={copyToClipboard}
                        onToggleFavorite={toggleFavorite}
                        onDelete={deleteItem}
                        onSelectItem={setSelectedItemId}
                      />
                    </TabPanel>
                    <TabPanel px={0}>
                      <ClipboardList
                        items={filteredHistory.filter(item => item.type === 'url')}
                        onCopy={copyToClipboard}
                        onToggleFavorite={toggleFavorite}
                        onDelete={deleteItem}
                        onSelectItem={setSelectedItemId}
                      />
                    </TabPanel>
                    <TabPanel px={0}>
                      <ClipboardList
                        items={filteredHistory.filter(item => item.type === 'code')}
                        onCopy={copyToClipboard}
                        onToggleFavorite={toggleFavorite}
                        onDelete={deleteItem}
                        onSelectItem={setSelectedItemId}
                      />
                    </TabPanel>
                    <TabPanel px={0}>
                      <ClipboardList
                        items={filteredHistory.filter(item => item.type === 'text')}
                        onCopy={copyToClipboard}
                        onToggleFavorite={toggleFavorite}
                        onDelete={deleteItem}
                        onSelectItem={setSelectedItemId}
                      />
                    </TabPanel>
                    <TabPanel px={0}>
                      <ClipboardList
                        items={filteredHistory.filter(item => item.isFavorite)}
                        onCopy={copyToClipboard}
                        onToggleFavorite={toggleFavorite}
                        onDelete={deleteItem}
                        onSelectItem={setSelectedItemId}
                      />
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Box>
            </VStack>
          </Box>

          {/* Right Section - 1/3 width */}
          <Box flex={{ base: '1 1 100%', md: '1 0 0' }} minW="0" w="100%" display={{ base: 'none', md: 'block' }}>
            <VStack w="full" spacing={4}>
              <Textarea
                placeholder="Type or paste content here..."
                value={selectedText}
                onChange={(e) => setSelectedText(e.target.value)}
                resize="none"
                rows={4}
              />
              <Button
                colorScheme="blue"
                onClick={addToClipboard}
                isDisabled={!selectedText.trim()}
                w="full"
              >
                Add to Clipboard
              </Button>

              {selectedItem && (
                <>
                  <Heading size="md" alignSelf="start">Edit Item</Heading>
                  <Textarea
                    value={selectedItem.content}
                    onChange={(e) => {
                      const updatedContent = e.target.value;
                      if (selectedItem) {
                        setClipboardHistory(prev =>
                          prev.map(item =>
                            item.id === selectedItem.id
                              ? { ...item, content: updatedContent }
                              : item
                          )
                        );
                      }
                    }}
                    minH="300px"
                  />
                </>
              )}
            </VStack>
          </Box>
        </HStack>
      </VStack>
    </Box>
  );
}

const ClipboardList = React.memo<ClipboardListProps>(function ClipboardList({ 
  items, 
  onCopy, 
  onToggleFavorite, 
  onDelete, 
  onSelectItem 
}) {
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());
  const bgItem = useColorModeValue('gray.50', 'gray.700');
  const codeBg = useColorModeValue('gray.100', 'gray.800');
  const codeBorder = useColorModeValue('gray.200', 'gray.600');
  const bgHover = useColorModeValue('gray.100', 'gray.600');
  const fadeMask = useColorModeValue(
    'linear-gradient(transparent 0%, white 90%)',
    'linear-gradient(transparent 0%, var(--chakra-colors-gray-700) 90%)'
  );

  const toggleExpand = React.useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  if (items.length === 0) {
    return (
      <Text color="gray.500" textAlign="center" py={8}>
        No items found
      </Text>
    );
  }

  return (
    <List spacing={3}>
      {items.map((item) => {
        const isExpanded = expandedItems.has(item.id);
        const shouldTruncate = item.content.length > 150 && !isExpanded;

        return (
          <ListItem 
            key={item.id}
            p={4}
            borderWidth={1}
            borderRadius="md"
            bg={bgItem}
            _hover={{ bg: bgHover }}
            cursor="pointer"
            onClick={() => onSelectItem(item.id)}
            position="relative"
          >
            <VStack align="stretch" spacing={2}>
              <HStack justify="space-between">
                <HStack>
                  <Text fontSize="sm" color="gray.500">
                    {item.timestamp.toLocaleString()}
                  </Text>
                  <Badge colorScheme={item.type === 'code' ? 'purple' : item.type === 'url' ? 'green' : 'blue'}>
                    {item.type}
                  </Badge>
                </HStack>
                <HStack spacing={1}>
                  <IconButton
                    aria-label="Toggle favorite"
                    icon={<StarIcon color={item.isFavorite ? 'yellow.400' : 'gray.400'} />}
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(item.id);
                    }}
                  />
                  <IconButton
                    aria-label="Copy to clipboard"
                    icon={<CopyIcon />}
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCopy(item.content);
                    }}
                  />
                  <IconButton
                    aria-label="Delete item"
                    icon={<DeleteIcon />}
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                  />
                </HStack>
              </HStack>
              <Box position="relative">
                {item.type === 'code' ? (
                  <Box position="relative">
                    <Code
                      w="full"
                      p={3}
                      borderRadius="md"
                      display="block"
                      whiteSpace="pre"
                      overflowX="hidden"
                      bg={codeBg}
                      borderColor={codeBorder}
                      borderWidth={1}
                      fontSize="sm"
                      maxHeight={shouldTruncate ? "100px" : "none"}
                      overflowY={shouldTruncate ? "hidden" : "auto"}
                      css={shouldTruncate ? {
                        maskImage: fadeMask,
                        WebkitMaskImage: fadeMask
                      } : undefined}
                    >
                      {item.content}
                    </Code>
                    {shouldTruncate && (
                      <Button
                        size="sm"
                        variant="ghost"
                        position="absolute"
                        bottom="0"
                        right="0"
                        zIndex={1}
                        onClick={(e) => toggleExpand(item.id, e)}
                      >
                        View more
                      </Button>
                    )}
                  </Box>
                ) : (
                  <Box position="relative">
                    <Text
                      fontSize="sm"
                      noOfLines={shouldTruncate ? 3 : undefined}
                      position="relative"
                      css={shouldTruncate ? {
                        maskImage: fadeMask,
                        WebkitMaskImage: fadeMask
                      } : undefined}
                    >
                      {item.content}
                    </Text>
                    {shouldTruncate && (
                      <Button
                        size="sm"
                        variant="ghost"
                        position="absolute"
                        bottom="0"
                        right="0"
                        zIndex={1}
                        onClick={(e) => toggleExpand(item.id, e)}
                      >
                        View more
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            </VStack>
          </ListItem>
        );
      })}
    </List>
  );
});

export default App;
