import React from 'react';

// Ant Design Icons
import {
  UserOutlined,
  CloseCircleFilled,
  SearchOutlined as AntSearchOutlined, // Renamed to avoid conflict
  InfoCircleOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  SendOutlined,
} from '@ant-design/icons';

// Lucide React Icons
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Award,
    Bell,
    Building,
    Calendar,
    CalendarX,
    Check,
    CheckCircle,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Circle,
    Clock,
    CreditCard,
    DollarSign,
    Download,
    Edit,
    Eye,
    FileSignature,
    FileText,
    Filter,
    FolderOpen,
    Gavel,
    GripVertical,
    History,
    Inbox,
    LineChart,
    MapPin,
    MessageSquare,
    Mic,
    MicOff,
    Phone,
    Plus,
    Printer,
    Search,
    Send,
    Star,
    ThumbsDown,
    ThumbsUp,
    Trash2,
    Upload,
    Users,
    Video,
    VideoOff,
    X,
    XCircle,
} from 'lucide-react';

// Define an index of all available icons
const icons: { [key: string]: React.ComponentType<any> } = {
  // Ant Design
  UserOutlined,
  CloseCircleFilled,
  AntSearchOutlined, // Use the new name
  InfoCircleOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  SendOutlined,

  // Lucide
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  Bell,
  Building,
  Calendar,
  CalendarX,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Edit,
  Eye,
  FileSignature,
  FileText,
  Filter,
  FolderOpen,
  Gavel,
  GripVertical,
  History,
  Inbox,
  LineChart,
  MapPin,
  MessageSquare,
  Mic,
  MicOff,
  Phone,
  Plus,
  Printer,
  Search,
  Send,
  Star,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Upload,
  Users,
  Video,
  VideoOff,
  X,
  XCircle,
};

interface CustomIconProps {
  type: string;
  [key: string]: any; // Allow other props like style, etc.
}

const CustomIcon: React.FC<CustomIconProps> = ({ type, ...restProps }) => {
  const IconComponent = icons[type];

  if (!IconComponent) {
    // Return a default icon or null if not found, with a console warning
    console.warn(`Icon "${type}" not found in CustomIcon library.`);
    return null; 
  }

  return <IconComponent {...restProps} />;
};

export default CustomIcon;
